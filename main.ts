import * as d3 from 'd3'
import './main.css'
class WaveGenerator {

    private audioContext: AudioContext = null
    private analyser: AnalyserNode = null
    private mediaStream: MediaStream = null
    private source: MediaStreamAudioSourceNode = null
    private processor: ScriptProcessorNode = null
    public windowWidth: number = window.innerWidth - 10
    public windowHeight: number = window.innerHeight - 100
    private frequencyData: Uint8Array = null
    private colorScale: any
    private circleX: any
    private readonly frequencyBinCount = 128
    private readonly maxStdAmplitude = 16
    private xScaler = d3.scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 200])
    private yScaler = d3.scaleLinear().domain([0, this.maxStdAmplitude]).range([185, 0])
    private svg: any
    private isListening: boolean = false

    constructor() {
        this.setMicrophoneAudioToContext()
        document.getElementById('start-waves').addEventListener('click', this.initializeAudioContext.bind(this))
    }

    private async setMicrophoneAudioToContext() {
        try {

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

        }
        catch (error) {

            throw error

        }
    }

    private initializeAudioContext() {

        if (!this.isListening) {
            this.audioContext = new AudioContext()
    
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
            this.analyser = this.audioContext.createAnalyser()
            // this.processor = this.audioContext.createScriptProcessor(1024, 1, 1)
    
            // this.source.connect(this.processor)
            this.source.connect(this.analyser)
            // this.processor.connect(this.audioContext.destination)
    
            this.analyser.connect(this.audioContext.destination)
    
            // this.processor.onaudioprocess = this.generateGraphFromAudio.bind(this)
            this.isListening = true

            this.initChart()
        } else {
            confirm("An audio context is already configured")
        }
    }

    private initChart() {
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)

        this.analyser.getByteFrequencyData(this.frequencyData)

        this.colorScale = d3.scaleLinear()
            .domain([0, 150])
            .range((["purple", "red", "green"]) as any)

        // this.colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain(d3.extent(this.frequencyData, (d: any) => d.value))

        this.circleX = d3.scaleLinear()
            .domain([0, this.frequencyData.length])
            .range([0, this.windowWidth])

        this.svg = d3.select('#wave-container').append('svg')
            .attr('width', this.windowWidth)
            .attr('height', 250)
            .classed('graph__outline', true)

        const w = this.xScaler(1) - this.xScaler(0)
        const rx = w * 0.1
        // logic for rectangles
        let rects = this.svg.selectAll('rect')
            .data(this.frequencyData).enter().append('rect')
            .style('fill', (datum: any, index: any) => this.colorScale(datum))
            // .style('transition-timing-function', 'linear')
            // .style('transition-duration', '5ms')
            .attr('width', () => w) // this.windowWidth / data.length + .3
            .attr('rx', rx)
            .attr('x', (datum: any, index: any) => this.xScaler(index))
            .attr('y', (datum: any, index: any) => this.yScaler(datum))
            .attr('height', (datum: any) => (this.yScaler(0) - this.yScaler(datum))) //
            .attr('opacity', 0)
            .transition()
            .duration(0)
            .ease(d3.easeLinear)
            .attr('opacity', 0.6)

        const drawChart = () => {
            requestAnimationFrame(drawChart)

            this.analyser.getByteFrequencyData(this.frequencyData)

            this.svg.selectAll('rect')
                .data(this.frequencyData)
                .transition()
                .duration(5)
                .ease(d3.easeLinear)
                .style('fill', (datum: any, index: any) => this.colorScale(datum))

                .attr('y', (datum: any, index: any) => this.windowHeight / 4 - datum)
                .attr('height', (datum: any, index: any) => (this.yScaler(0) - this.yScaler(datum)))
        }

        drawChart()
        
    }


    private initializeUserMediaListeners() {
        this.mediaStream.onaddtrack = this.addMediaStreamTrack.bind(this)
    }

    private addMediaStreamTrack(event: any) { // MediaStreamTrackEvent
        console.log(event)
    }

}

const generator = new WaveGenerator()
