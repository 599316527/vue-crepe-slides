# Crepe Slides for Vue

## Feature

* Stackable layers on single slide
* Available various media layers
* Configurable layer style at every stage of animations
* Support both mouse and touch devices

## Usage

```vue
import CrepeSlides from 'vue-crepe-slides'

<crepe-slides
  :slides="slides"
  :width="360"
  :aspect-ratio="16 / 9"
></crepe-slides>
```

### Options

#### slides

The array of slide which contains name, nested layers and optional href. See the [sample](demo/slides.json).

#### width

The value of width without unit.

#### aspect-ratio

The value of ratio of width and height.

#### can-play-video

Video Layer requires video support on the browser. Three state are defined in [`import {VideoSupportState} from 'vue-crepe-slides/constant'`](lib/video-support-state.js).

#### interactive-type

Mouse or touch could be specified if the component is only used on PC or mobile devices. Three state are defined in [`import {InteractiveType} from 'vue-crepe-slides/constant'`](lib/interactive-type.js).


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
