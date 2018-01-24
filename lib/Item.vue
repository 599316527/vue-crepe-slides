<template>
<div class="slides-item" :style="{
  width: width + 'px',
  height: height + 'px'
}" :data-name="album.name">
  <component v-for="(layer, index) in album.layers" :key="index"
    :is="layer.type + '-layer'" v-bind="layer" :progress="progress"
    :width="width" :height="height" :options="options"></component>
  <a class="layer hyper-link-layer" v-if="album.href" :href="album.href"
    @click="handleItemHrefClick"></a>
</div>
</template>

<script>
import ImageLayer from './layer/Image'
import VideoLayer from './layer/Video'
import TextLayer from './layer/Text'
import GroupLayer from './layer/Group'

export default {
  name: 'slides-item',
  components: {
    ImageLayer,
    VideoLayer,
    TextLayer,
    GroupLayer
  },
  props: {
    album: Object,
    width: Number,
    height: Number,

    progress: Number,
    options: Object
  },
  data () {
    return {

    }
  },
  computed: {

  },
  methods: {
    handleItemHrefClick() {
      let index = this.album._index
      let name = this.album.name

      // event here
    }
  }
}
</script>

<style lang="less" scoped>
.slides-item {
  overflow: hidden;
  position: relative;

  a {
    text-decoration: none;
  }

  .layer {
    position: absolute;
  }

  .hyper-link-layer {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
