import { scaleLinear, select, easeLinear, ScaleLinear, scaleSequential, interpolateYlGnBu, extent, } from 'd3'
import './main.css'
class WaveGenerator {
    private audioContext: AudioContext = null
    private analyser: AnalyserNode = null
    private mediaStream: MediaStream = null
    private source: MediaStreamAudioSourceNode = null
    private frequencyData: Uint8Array = null
    private colorScale: ScaleLinear<number, number>
    private readonly windowWidth: number = window.innerWidth - 10
    private readonly windowHeight: number = window.innerHeight - 100
    private readonly frequencyBinCount = 128
    private readonly maxStdAmplitude = 16
    private xScaler: ScaleLinear<number, number>
    private yScaler: ScaleLinear<number, number>
    private svg: any
    private isListening: boolean = false

    constructor() {
        // when the WaveGenerator class is instantiated, we want to:
        // - setup the audio context using the microphone
        // - setup an event listener on the '#start-waves' button 

        // create linear scale functions used for calculating the radius on the x and y axes, width, and the height
        this.xScaler = scaleLinear().domain([0, this.frequencyBinCount - 1]).range([0, 200])
        this.yScaler = scaleLinear().domain([0, this.maxStdAmplitude]).range([185, 0])

        this.setMicrophoneAudioToContext()
        document.getElementById('start-waves').addEventListener('click', this.initializeAudioContext.bind(this))
    }

    private async setMicrophoneAudioToContext() {
        try {

            // create a media stream object from the getUserMedia api
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

        }
        catch (error) {

            throw error

        }
    }

    private initializeAudioContext() {

        // create the audiocontext objet, configure the source, and the analyser 
        // the analyser will be responsible for intercepting the audio data from the source in the 'node graph'
        // and creating a data structure that can be used for visualizing the audio waves
        if (!this.isListening) {
            this.audioContext = new AudioContext()
    
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
            this.analyser = this.audioContext.createAnalyser()

            // connect the analyser to the source
            this.source.connect(this.analyser)

            this.analyser.connect(this.audioContext.destination)
            this.isListening = true

            this.initChart()
        } else {
            confirm("An audio context is already configured")
        }
    }

    private initChart() {

        // create a typed array from the analyser frequency data
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount)
        this.analyser.getByteFrequencyData(this.frequencyData)

        // setup the color scale function for adding color styles to the graph
        this.colorScale = scaleLinear()
            .domain([0, 150])
            .range((["purple", "red", "blue"]) as any)

        // this.colorScale = scaleSequential(interpolateYlGnBu).domain(extent(this.frequencyData, (d: any) => d.value))

        // initialize the svg element and append it to the DOM
        this.svg = select('#wave-container').append('svg')
            .attr('width', this.windowWidth)
            .attr('height', 250)
            .classed('graph__outline', true)

        // setup the width of the graph using the x and y scaler functions declared above
        const w = this.xScaler(1) - this.xScaler(0)

        // define the radius on the x axis
        const rx = w * 0.1

        // since the visualizations consist of many small rectangles, we want to style them relative to the typed array data 
        this.svg.selectAll('rect')
            .data(this.frequencyData).enter().append('rect')
            // style the rectangles based on the datum returned from the arrow function
            .style('fill', datum => this.colorScale(datum))

            // set rectangle element attribtues
                .attr('width', () => w)
                .attr('rx', rx)
                .attr('x', (_: any, index: any) => this.xScaler(index))
                .attr('y', datum => this.yScaler(datum))
                .attr('height', datum => (this.yScaler(0) - this.yScaler(datum)))
                .attr('opacity', 0)
            .transition()
                .duration(0)
                    .ease(easeLinear)
                        .attr('opacity', 0.6)

        // setup a function to draw the chart
        const drawChart = () => {
            // asynchronously call the drawChart recursively when the animation needs to be redrawn 
            requestAnimationFrame(drawChart)


            this.analyser.getByteFrequencyData(this.frequencyData)

            // redraw the rectangles in the graph
            this.svg.selectAll('rect')
                .data(this.frequencyData)
                    .transition()
                        .duration(5)
                            .ease(easeLinear)
                .style('fill', datum => this.colorScale(datum))
                    .attr('y', datum => this.windowHeight / 4 - datum)
                    .attr('height', datum => (this.yScaler(0) - this.yScaler(datum)))
        }

        drawChart()
        
    }

}

const generator = new WaveGenerator()
