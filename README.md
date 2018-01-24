# Crepe Slides for Vue

[DEMO](https://599316527.github.io/vue-crepe-slides/)

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

Each layer has attributes:
* `type`: The field indicates type of layer. Avaiable type is `image`, `video`, `text`, `group`.
* `image`: If type is image, the field indicates image url.
* `poster`, `video`: If type is video, the fields indicate video poster & source urls.
* `text`: If type is text, the field indicates text content of the layer.
* `children`: If type is group, the field indicates an array of nested layers.
* `styles`: The field indicates static style of the layer. It's just CSS.
* `transition`: The field indicates timing function & styles of stages of slide animation.
  - `timing`: Availabe timing functions are defined in [ease-component](https://www.npmjs.com/package/ease-component)
  - `styles`: Styles of three stages (enter, stay, leave) of slide animation could be specified here. Tween values are computed automatically by the timing function with stage styles. Transform methods have their shorthand writing style. Some values without units of special fields will be appended unit automatically. Value of style could be a expression with predefined variables. Current available variables are `@containerWidth`, `@containerHeight` for all layers and `@duration` for video only.

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
