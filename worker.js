const mainWorker = new Worker('bundle.js')

mainWorker.postMessage({ state: 'start' })

mainWorker.onmessage = (event) => console.log(event)

mainWorker.addEventListener('message', (event) => console.log(event))