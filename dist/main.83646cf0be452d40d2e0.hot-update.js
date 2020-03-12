webpackHotUpdate("main",{

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __importStar(__webpack_require__(/*! d3 */ "./node_modules/d3/index.js"));
__webpack_require__(/*! ./main.css */ "./main.css");
class WaveGenerator {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.source = null;
        this.processor = null;
        this.windowWidth = window.innerWidth - 10;
        this.windowHeight = window.innerHeight - 100;
        this.frequencyData = null;
        this.frequencyBinCount = 128;
        this.maxStdAmplitude = 16;
        this.xScaler = d3.scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 200]);
        this.yScaler = d3.scaleLinear().domain([0, this.maxStdAmplitude]).range([185, 0]);
        this.isListening = false;
        this.setMicrophoneAudioToContext();
        document.getElementById('start-waves').addEventListener('click', this.initializeAudioContext.bind(this));
    }
    setMicrophoneAudioToContext() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.mediaStream = yield navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            }
            catch (error) {
                throw error;
            }
        });
    }
    initializeAudioContext() {
        if (!this.isListening) {
            this.audioContext = new AudioContext();
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            // this.processor = this.audioContext.createScriptProcessor(1024, 1, 1)
            // this.source.connect(this.processor)
            this.source.connect(this.analyser);
            // this.processor.connect(this.audioContext.destination)
            this.analyser.connect(this.audioContext.destination);
            // this.processor.onaudioprocess = this.generateGraphFromAudio.bind(this)
            this.isListening = true;
            this.initChart();
        }
        else {
            confirm("An audio context is already configured");
        }
    }
    initChart() {
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.colorScale = d3.scaleLinear()
            .domain([0, 150])
            .range((["purple", "red", "green"]));
        // this.colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain(d3.extent(this.frequencyData, (d: any) => d.value))
        this.circleX = d3.scaleLinear()
            .domain([0, this.frequencyData.length])
            .range([0, this.windowWidth]);
        this.svg = d3.select('#wave-container').append('svg')
            .attr('width', this.windowWidth)
            .attr('height', 250)
            .classed('graph__outline', true);
        // .call(
        //     d3.axisLeft(this.yScaler)
        //         .ticks(30)
        //         .tickSize(-this.windowWidth / 1.1)
        //         .tickFormat(
        //             d3.format("" as any)
        //         )
        // )
        const w = this.xScaler(1) - this.xScaler(0);
        const rx = w * 0.1;
        // logic for rectangles
        let rects = this.svg.selectAll('rect')
            .data(this.frequencyData).enter().append('rect')
            .style('fill', (datum, index) => this.colorScale(datum))
            // .style('transition-timing-function', 'linear')
            // .style('transition-duration', '5ms')
            .attr('width', () => w) // this.windowWidth / data.length + .3
            .attr('rx', rx)
            .attr('x', (datum, index) => this.xScaler(index))
            .attr('y', (datum, index) => this.yScaler(datum))
            .attr('height', (datum) => (this.yScaler(0) - this.yScaler(datum))) //
            .attr('opacity', 0)
            .transition()
            .duration(0)
            .ease(d3.easeLinear)
            .attr('opacity', 0.6);
        const drawChart = () => {
            requestAnimationFrame(drawChart);
            this.analyser.getByteFrequencyData(this.frequencyData);
            this.svg.selectAll('rect')
                .data(this.frequencyData)
                .transition()
                .duration(5)
                .ease(d3.easeLinear)
                .style('fill', (datum, index) => this.colorScale(datum))
                .attr('y', (datum, index) => this.windowHeight / 4 - datum)
                .attr('height', (datum, index) => (this.yScaler(0) - this.yScaler(datum)));
        };
        drawChart();
    }
    initializeUserMediaListeners() {
        this.mediaStream.onaddtrack = this.addMediaStreamTrack.bind(this);
    }
    addMediaStreamTrack(event) {
        console.log(event);
    }
}
const generator = new WaveGenerator();


/***/ })

})
//# sourceMappingURL=main.83646cf0be452d40d2e0.hot-update.js.map