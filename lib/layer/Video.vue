
<style lang="less" scoped>
.slides-video {
  background: black;

  .poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>

<template>
<div class="layer slides-video" :style="parsedStyle">
  <img v-if="useImageOnly" :src="poster" class="poster" />
  <video v-else :width="width" :height="height" :src="video" :poster="poster" ref="video"
    preload="auto" autoplay muted playsinline webkit-playsinline
    @playing="handleVideoPlaying" @loadedmetadata="handleVideoLoadedMetadata"></video>
</div>
</template>

<script>
import {intersection} from 'lodash'
import LayerMixin from './Layer'
import eases from 'ease-component'
import {calculateExpression} from './util'
import VideoSupportState from '../video-support-state'

export default {
  name: 'slides-video',
  mixins: [
    LayerMixin
  ],
  props: {
    poster: String,
    video: String
  },
  data () {
    return {
      videoDuration: 0,
      isVideoInited: false
    }
  },
  computed: {
    useImageOnly() {
      // 国产浏览器的 <video> 实现都他妈的野路子，没法用，就只出图片咯
      return this.options.canPlayVideo === VideoSupportState.NONE
    },
    brokenCurrentTime() {
      return this.options.canPlayVideo === VideoSupportState.SEMI
    },
    transitionDuration() {
      let videoDuration = this.videoDuration
      let keyframes = this.transition && this.transition.duration || {}
      return Object.keys(keyframes).reduce(function (phases, key) {
        let keyframe = keyframes[key]
        phases[key] = Object.keys(keyframe).reduce(function (styles, key) {
          let val = keyframe[key]
          if (typeof val === 'string' && val.indexOf('@') >= 0) {
            keyframe[key] = calculateExpression(val, {
              '@duration': videoDuration
            })
          }
          return styles
        }, keyframe)
        return phases
      }, {
        enter: {},
        stay: {},
        leave: {}
      })
    }
  },
  watch: {
    progress(val) {
      if (this.useImageOnly) {
        return
      }

      let progress = this.progress
      let ease = eases[this.transition ? this.transition.timing : 'linear']

      let {enter, stay, leave} = this.transitionDuration

      let intermediateVideoAttributes = getIntermediateVideoAttributes(
        progress <= 0.5 ? enter : leave,
        stay,
        ease(progress <= 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2)
      )

      applyAttrubites(this.$refs.video, intermediateVideoAttributes)
    },
    options({active, isAnimating, isDragging}) {
      if (active && !isAnimating && !isDragging) {
        // 有些 <video> 用 currentTime 控制进度好像不生效，所以就播放视频吧
        if (this.brokenCurrentTime) {
          let $video = this.$refs.video
          if ($video && $video.currentTime < $video.duration * .95) {
            $video.play()
          }
        }
      }
    }
  },
  methods: {
    handleVideoPlaying() {
      let $video = this.$refs.video
      if (!$video) {
        return
      }

      // 主要就是为了触发一次 click to play
      // 只有在外部调用 video.play() 才进这个逻辑
      if (!this.isVideoInited) {
        this.isVideoInited = true
        $video.pause()
        // applyAttrubites(this.$refs.video, this.transitionDuration.stay)
      }

      // 记录播放次数, 给外部的 weixin hack 用
      if (this.brokenCurrentTime) {
        this.playCount = (this.playCount || 0) + 1
        $video.dataset.playCount = this.playCount
      }
    },
    handleVideoLoadedMetadata() {
      this.videoDuration = this.$refs.video.duration
    }
  }
}

function getIntermediateVideoAttributes(from, to, progress) {
  return intersection(Object.keys(from), Object.keys(to))
    .reduce(function (attrs, key) {
      let fromValue = from[key]
      let toValue = to[key]
      let delta = toValue - fromValue
      if (!isNaN(delta)) {
        attrs[key] = fromValue + delta * progress
        // console.log(attrs[key])
      }
      return attrs
    }, {})
}

function applyAttrubites(el, attrs) {
  Object.keys(attrs).forEach(function (key) {
    el[key] = attrs[key]
  })
}
</script>
