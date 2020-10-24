<template>
  <div class="app">
    <div>
      <div class="toolbar">
        <input
          type="color"
          width="200px"
          v-model="activeColor"
          @change="
            setCanvasOptions({
              strokeStyle: activeColor,
              fillStyle: activeColor
            })
          "
          class="color-picker"
        />
      </div>

      <canvas
        width="300"
        height="300"
        id="canvas"
        class="canvas"
        @mousedown="drawOn"
        @mousemove="draw"
        @mouseup="drawOff()"
        @click="setTextPos"
      />

      <textarea
        cols="30"
        rows="10"
        v-model="text"
        @keyup.enter="setText"
        v-if="writingModal"
      />
    </div>

    <div class="AppState">
      <div class="AppState-header">
        <h4>App State</h4>
      </div>
      <ul>
        <li v-for="(data, index) in dataValues" :key="index">
          <b
            >{{ index }}:
            <span :style="{ color: propColor(data) }">{{ data }}</span></b
          >
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { propColor, toggleActive } from '@/functions/helpers.js'
import shortid from 'shortid'
export default {
  data: function() {
    return {
      userid: shortid.generate(),
      mode: 'draw',
      drawing: false,
      writingModal: false,
      activeColor: '#000000',
      x: 0,
      y: 0,
      text: '',
      canvasCords: '',
      canvas: '',
      defaultCanvas: {
        font: '30px Comic Sans MS'
      }
    }
  },
  mounted() {
    console.log(this)
    this.loadCanvas()
    const id = this.$route.params.id
    console.log(id)

    const observer = this.$apollo.subscribe({
      query: require('../graphql/drawer/CanvasUpdated.gql'),
      variables: { id }
    })
    observer.subscribe({
      next: ({ data }) => {
        const { x, y, drawing, userid, event } = data.canvasUpdated
        if (userid === this.userid) return
        console.log({ x, y, drawing, userid, event })
        this.drawing = drawing
        this.x = x
        this.y = y
        if (event === 'drawOn') return this.canvas.beginPath()
        if (event === 'draw') return this[event]('sub')
      },
      error(err) {
        console.log(err.result.errors.map(e => e.message))
      }
    })
  },
  methods: {
    setMode(mode) {
      this.mode = mode
    },
    drawOn() {
      if (this.mode !== 'draw') return
      this.drawing = true
      this.canvas.beginPath()
      this.mutate('drawOn')
    },
    drawOff() {
      this.drawing = false
      this.mutate('drawOff')
    },
    draw(e) {
      if (e === 'sub' && this.drawing) return this.stroke(this.x, this.y)

      this.x = e.clientX - this.canvasCords.x
      this.y = e.clientY - this.canvasCords.y
      if (!this.drawing) return

      console.log('draw()')

      this.stroke(this.x, this.y)
      this.mutate('draw')
    },
    stroke(x, y) {
      console.log('stroke()')

      this.canvas.lineTo(x, y)

      this.canvas.stroke()
    },
    mutate(event = null) {
      const { x, y, drawing, userid } = this.$data
      this.$apollo.mutate({
        mutation: require('../graphql/drawer/UpdateCanvasState.gql'),
        variables: {
          id: this.$route.params.id,
          state: { x, y, drawing, userid, event }
        }
      })
    },
    setTextPos(e) {
      if (this.mode !== 'write') return
      this.x = e.clientX - this.canvasCords.x
      this.y = e.clientY - this.canvasCords.y
      this.writingModal = true
    },
    setText() {
      const { text, x, y } = this
      this.canvas.fillText(text, x, y)
      this.writingModal = false
      this.text = ''
    },
    fill() {
      const { width, height } = document.querySelector('#canvas')
      this.canvas.fillStyle = this.activeColor
      this.canvas.fillRect(0, 0, width, height)
    },
    loadCanvas() {
      console.log('loadCanvas()')
      const canvas = document.querySelector('#canvas')
      this.canvas = canvas.getContext('2d')
      const boundingClient = canvas.getBoundingClientRect()
      console.log(this.canvas)
      this.canvasCords = {
        x: Math.round(boundingClient.left),
        y: Math.round(boundingClient.top)
      }
      this.setCanvasOptions(this.defaultCanvas)
    },
    setCanvasOptions(opts) {
      console.log('setCanvasOptions -> opts', opts)
      for (const key in opts) {
        const value = opts[key]
        this.canvas[key] = value
      }
    },
    onCanvasUpdated(prevResult, { subData }) {
      console.log('onCanvasUpdated -> prevResult', prevResult)
      console.log('onCanvasUpdated -> subData', subData)
    },
    propColor,
    toggleActive
  },
  computed: {
    dataValues() {
      return this.$data
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}
li {
  list-style-type: none;
}
li b {
  color: green;
}
.app {
  margin-left: 40px;
  position: relative;
  display: flex;
}
.app textarea {
  position: absolute;
  top: 50%;
  left: 150%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.toolbar {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 50px;
  width: 235px;
  margin: 0 auto;
  padding: 10px;
}
.toolbar * {
  cursor: pointer;
  display: inline-block;
  width: 30px;
  height: 30px;
  padding: 5px;
  margin-right: 5px;
  border-radius: 5px;
}
.toolbar img {
  border: 1px solid gray;
  -webkit-transition: background-color 0.3s;
  transition: background-color 0.3s;
  background-color: rgba(255, 255, 255, 0.815);
}
.toolbar img:hover {
  background-color: rgba(128, 128, 128, 0.164);
}
.toolbar .active-tool {
  background-color: rgba(128, 128, 128, 0.164);
}
canvas {
  display: inline-block;
  border: 2px solid black;
  border-radius: 10px;
  overflow: hidden;
}
.AppState {
  border: 1px solid rgba(0, 0, 0, 0.623);
  margin-left: 50px;
  background: #cacaca65;
  border-radius: 10px;
  width: 450px;
}
.AppState-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  color: #35b365;
  border-bottom: 1px solid black;
  padding: 10px 15px;
}
.AppState-header h4 {
  margin: 0px;
}
.AppState .vue-icon {
  height: 30px;
  margin-right: 5px;
}
.pen-cursor,
.goma-ico {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
}
/*# sourceMappingURL=styles.min.css.map */
</style>
