const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append("업로드 준비 완료!!")  
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    image.style.width = 'auto';
    image.style.height = '600px';
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    document.getElementById("result").innerHTML=""; // lotto reset
    results.forEach((result, i) => {
      //-----------------------------------------------------------------------------------------
      var lotto = [];
      for(var i=0;i<6;i++){
        var num = Math.floor(Math.random() * 44) + 1;
        for(var j in lotto){
          while(num == lotto[j]){
            num = Math.floor(Math.random() * 44) + 1;
          }
        }
        lotto.push(num);
      }
      lotto.sort(function(a,b){
        return a - b;
      });
      const str = '<b><font size="5em" color=red>\n얼굴분석 로또 번호</font> : <font size="5em">' + lotto + '</font></b>'

      document.getElementById("result").innerHTML=str;
      //document.body.append().innerHTML=str;
      //-----------------------------------------------------------------------------------------
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: 'face' })
      drawBox.draw(canvas)
    })
  })
}

function loadLabeledImages() {
  const labels = ['Hyunjin Seo', 'Min', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
