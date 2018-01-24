import {extend, intersection} from 'lodash'
import eases from 'ease-component'
import {calculateExpression} from './util'


const cssTransformKeys = [
  'translate', 'translateX', 'translateY',
  'scale', 'scaleX', 'scaleY',
  'rotate', 'rotateX','rotateY','rotateZ',
  'skew', 'skewX', 'skewY'
]

const shouldBeUnitFixedStyleAttributes = ([
  'top', 'right', 'bottom', 'left',
  'width', 'height',
  'translate', 'translateX', 'translateY',
  'rotate', 'rotateX','rotateY','rotateZ',
  'skew', 'skewX', 'skewY'
])

export default {
  props: {
    type: String,

    width: Number,
    height: Number,

    styles: Object,
    transition: Object,

    progress: Number,
    options: Object
  },
  computed: {
    runtimeParamsMap() {
      return {
        '@containerWidth': this.width,
        '@containerHeight': this.height
      }
    },
    parsedStyle() {
      let styles = this.styles ? extend({}, this.styles) : {}
      if (this.transition && this.transition.styles && this.transition.styles.stay) {
        styles = extend(styles, this.transition.styles.stay)
      }
      styles = fixStyleValue(styles, this.runtimeParamsMap)
      styles = extend(styles, this.getProgressStyle())
      styles = fixCssTransformValue(styles)
      // console.log(JSON.stringify(this.getProgressStyle(),null,4))
      return styles
    },
    transitionStyle() {
      let runtimeParamsMap = this.runtimeParamsMap
      let styles = this.transition ? this.transition.styles : {}
      return Object.keys(styles || {}).reduce(function (ret, stage) {
        ret[stage] = styles[stage] ? fixStyleValue(styles[stage], runtimeParamsMap) : {}
        ret[stage] = Object.keys(ret[stage]).reduce(function (rules, key) {
          rules[key] = getDigitAndUnitFromValue(ret[stage][key])
          return rules
        }, {})
        return ret
      }, {
        enter: {},
        stay: {},
        leave: {}
      })
    }
  },
  methods: {
    getProgressStyle() {
      let progress = this.progress
      let ease = eases[this.transition ? this.transition.timing : 'linear']

      let {enter, stay, leave} = this.transitionStyle

      if (progress <= 0.5) {
        return getIntermediateStyle(enter, stay, ease(progress * 2))
      }
      else {
        // console.log(progress, 1 - (progress - 0.5) * 2, ease(1 - (progress - 0.5) * 2))
        return getIntermediateStyle(leave, stay, ease(1 - (progress - 0.5) * 2))
      }

      return {}
    }
  }
}


function fixStyleValue(styles, runtimeParamsMap) {
  return shouldBeUnitFixedStyleAttributes.reduce((styles, key) => {
    let val = styles[key]

    if (!val) {
      return styles
    }

    switch (typeof val) {
      case 'number':
        styles[key] += 'px'
        break

      case 'string':
        if (val.indexOf('@') >= 0) {
          // TODO: supports custom unit
          let expressionValue = calculateExpression(val, runtimeParamsMap)
          if (expressionValue !== null) {
            styles[key] = expressionValue + 'px'
          }
        }
        break
    }

    return styles
  }, styles)
}

function getDigitAndUnitFromValue(value) {
  if (typeof value === 'string') {
    value = value.toLowerCase()
    for (var i = 0; i < value.length; i++) {
      let c = value.charCodeAt(i)
      if (c > 0x60 || c < 0x2A) {
        let digit = parseFloat(value.substring(0, i), 10)
        let unit = value.substring(i)
        return {digit, unit}
      }
    }
  }
  return {
    digit: value,
    unit: null
  }
}

function getIntermediateStyle(from, to, progress) {
  return intersection(Object.keys(from), Object.keys(to))
    .reduce(function (styles, key) {
      let {digit: fromDigit, unit: fromUnit} = from[key]
      let {digit: toDigit, unit: toUnit} = to[key]
      let delta = toDigit - fromDigit
      if (fromUnit === toUnit && !isNaN(delta)) {
        styles[key] = formatDigitUnit(fromDigit + delta * progress, fromUnit)
        // console.log(key, styles[key])
      }
      return styles
    }, {})
}

function formatDigitUnit(digit, unit) {
  return digit.toFixed(5) + (unit || '')
}

function fixCssTransformValue(styles) {
  let parts = cssTransformKeys.filter(function (key) {
    return styles[key] !== undefined
  }).map(function (key) {
    return `${key}(${styles[key]})`
  })
  cssTransformKeys.forEach(function (key) {
    if (styles[key]) {
      delete styles[key]
    }
  })
  if (parts.length) {
    styles.transform = parts.join(' ')
  }
  return styles
}


