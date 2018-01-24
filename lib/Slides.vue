<template>
<div class="crepe-slides" :style="{ width: width + 'px' }">
  <div class="viewport" :style="{ height: height + 'px' }">
    <div class="items-wrapper" ref="wrapper" v-on="slideDragHandlers"
      :style="{
        width: wrapperWidth + 'px',
        left: (!isDragging && !isAnimating ? -1 * width : dynamicWrapperLeft) + 'px'
      }">
      <slides-item v-for="(item, index) in aliveItems" :key="item.name"
        :width="width" :height="height" :album="item" :options="{
          isAnimating, isDragging, canPlayVideo,
          active: index === 1
        }"
        :progress="-0.5 * (!isDragging && !isAnimating ? -1 * width : dynamicWrapperLeft) / width
          + 0.5 * (1 - index)">
      </slides-item>
    </div>
  </div>

  <div class="indicator" v-if="showIndicators">
    <ul>
      <li v-for="(item, index) in slides" :key="index" :class="{
        active: index === activeItemIndex
      }"></li>
    </ul>
  </div>
</div>
</template>

<script>
import {includes} from 'lodash'
import Tween from 'component-tween'
import SlidesItem from './Item'
import VideoSupportState from './video-support-state'
import InteractiveType from './interactive-type'

export default {
  name: 'crepe-slides',
  components: {
    SlidesItem
  },
  props: {
    slides: Array,
    width: Number,
    aspectRatio: Number,
    showIndicators: Boolean,
    canPlayVideo: {
      type: String,
      default: VideoSupportState.FULL,
      validator(val) {
        return includes(VideoSupportState, val)
      }
    },
    interactiveType: {
      type: String,
      default: InteractiveType.BOTH,
      validator(val) {
        return includes(InteractiveType, val)
      }
    }
  },
  data () {
    return {
      activeItemIndex: 0,

      isPointerDown: false,
      isAnimating: false,
      isDragging: false,
      dynamicWrapperLeft: 0
    }
  },
  computed: {
    height() {
      return this.width / this.aspectRatio
    },
    wrapperWidth() {
      return this.width * 3
    },
    aliveItems() {
      let i = this.activeItemIndex
      let items = this.slides
      let len = items.length
      let around = 1

      let indices = items.map((item, index) => index)
      return indices.concat(indices).concat(indices)
        .slice(i - around + len, i + around + 1 + len)
        .map(index => {
          items[index]._index = index
          return items[index]
        })
    },
    slideDragHandlers() {
      let type = this.interactiveType
      let handlers = {}
      if (type === InteractiveType.MOUSE || type === InteractiveType.BOTH) {
        handlers.mousedown = this.handleMouseDown
      }
      if (type === InteractiveType.TOUCH || type === InteractiveType.BOTH) {
        handlers.touchstart = this.handleTouchStart
      }
      return handlers
    }
  },
  methods: {
    handleTouchStart(evt) {
      document.body.addEventListener('touchmove', this.handleTouchMove)
      document.body.addEventListener('touchend', this.handleTouchEnd)

      let {touches} = evt
      if (this.isAnimating || touches.length > 1) {
        return
      }
      let {clientX, clientY} = touches[0]
      this.slideDragStart({clientX, clientY}, evt)
    },
    handleTouchMove(evt) {
      let {touches} = evt
      if (!this.isPointerDown || touches.length > 1) {
        return
      }
      let {clientX, clientY} = touches[0]
      this.slideDragMove({clientX, clientY}, evt)
    },
    handleTouchEnd(evt) {
      document.body.removeEventListener('touchmove', this.handleTouchMove)
      document.body.removeEventListener('touchend', this.handleTouchEnd)

      let {changedTouches: touches} = evt
      if (!this.isDragging || touches.length > 1) {
        return
      }
      let {clientX, clientY} = touches[0]
      this.slideDragEnd({clientX, clientY}, evt)
    },

    handleMouseDown(evt) {
      document.body.addEventListener('mousemove', this.handleMouseMove)
      document.body.addEventListener('mouseup', this.handleMouseUp)
      document.body.addEventListener('click', this.handleMouseClick)

      let {clientX, clientY, target} = evt
      this.slideDragStart({clientX, clientY}, evt)
    },
    handleMouseMove(evt) {
      evt.preventDefault()
      let {clientX, clientY} = evt
      this.slideDragMove({clientX, clientY}, evt)
    },
    handleMouseUp(evt) {
      document.body.removeEventListener('mousemove', this.handleMouseMove)
      document.body.removeEventListener('mouseup', this.handleMouseUp)

      if (this.isDragging) {
        this.mouseDraggedMark = true
        evt.preventDefault()
      }
      let {clientX, clientY} = evt
      this.slideDragEnd({clientX, clientY}, evt)
    },
    handleMouseClick(evt) {
      document.body.removeEventListener('click', this.handleMouseClick)
      if (this.mouseDraggedMark) {
        evt.preventDefault()
      }
      this.mouseDraggedMark = false
    },

    slideDragStart(pointer, evt) {
      if (this.isAnimating) {
        this.isAnimating = false
      }

      this.isPointerDown = true

      let wrapperLeft = parseFloat(this.$refs.wrapper.style.left, 10)
      this.previousWrapperLeft = wrapperLeft
      this.dynamicWrapperLeft = wrapperLeft

      this.previousDragPosX = pointer.clientX
      this.previousDragPosY = pointer.clientY
      this.previousDragStartTime = (new Date()).getTime()

      // HACK for browsers which support videos but require click to play
      if (this.canPlayVideo === VideoSupportState.SEMI) {
        Array.from(this.$el.querySelectorAll('video')).forEach(function (video) {
          if (!video.dataset.playCount) {
            video.play()
          }
        })
      }
    },
    slideDragMove(pointer, evt) {
      this.isDragging = true

      let deltaPosX = pointer.clientX - this.previousDragPosX
      let deltaPosY = pointer.clientY - this.previousDragPosY

      if (Math.abs(deltaPosY) > Math.abs(deltaPosX) * 7) {
        return
      }
      else {
        // prevent vertical scroll if user tends to scroll horizontally
        evt.preventDefault()
      }

      this.dynamicWrapperLeft = Math.min(0,
        Math.max(this.width * -2, this.previousWrapperLeft + deltaPosX))

      // console.log(this.dynamicWrapperLeft)

      this.previousDragMoveTime = (new Date()).getTime()
    },
    slideDragEnd(pointer, evt) {
      let deltaPosX = pointer.clientX - this.previousDragPosX

      let targetIndex
      let dynamicWrapperLeft = this.previousWrapperLeft + deltaPosX

      let dragEndTime = (new Date()).getTime()
      let deltaDragStartEnd = dragEndTime - this.previousDragStartTime
      let deltaDragMoveEnd = this.previousDragMoveTime - this.previousDragStartTime

      if (deltaDragMoveEnd < 120 && deltaDragStartEnd < 140 && Math.abs(deltaPosX) > 20) {
          // Moved for a long distance fastly --> previous/next slide
          targetIndex = deltaPosX > 0 ? 0 : 2
      }
      else {
          // Otherwise, determine which one to be switched by visible area.
          if (dynamicWrapperLeft < -1.5 * this.width) {
            targetIndex = 2
          }
          else if (dynamicWrapperLeft > -0.5 * this.width) {
            targetIndex = 0
          }
          else {
            targetIndex = 1
          }
      }

      let targetWrapperLeft = targetIndex * this.width * -1



      this.isPointerDown = false
      this.isDragging = false
      this.isAnimating = true

      let tween = Tween({left: dynamicWrapperLeft})
        .ease('out-quart')
        .to({left: targetWrapperLeft})
        .duration(300)

      tween.update((obj) => {
        this.dynamicWrapperLeft = obj.left
      })

      tween.on('end', () => {
        this.isAnimating = false
        let previousActiveItemIndex = this.activeItemIndex
        let activeItemIndex = this.aliveItems[targetIndex]._index
        this.activeItemIndex = activeItemIndex

        if (this.activeItemIndex !== previousActiveItemIndex) {
          let activeItemName = this.slides[activeItemIndex].name
          let aliasName = activeItemName ? `(${activeItemName})` : ''
          //  event here
        }
      })

      this.tween = tween

      let animate = () => {
        if (!this.isAnimating) {
          return
        }
        window.requestAnimationFrame(animate)
        tween.update()
      }

      animate()
    },
    handleDragCancel() {
      this.isDragging = false
      this.isAnimating = false
    }
  }
}
</script>

<style lang="less" scoped>
.crepe-slides {
  .viewport {
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .items-wrapper {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

  }

  .slides-item {
    float: left;
  }

  .indicator {
    ul {
      margin: 0;
      padding: 0;
      text-align: center;
      line-height: 1.2;

      li {
        display: inline-block;
        margin: 0 2px;
        width: 6px;
        height: 6px;
        border-radius: 10px;
        background-color: #d3d3d3;

        &.active {
          background-color: #a1a1a1;
        }
      }
    }
  }
}
</style>
