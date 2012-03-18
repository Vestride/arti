var artifactData;

$(document).ready(function() {
    socket.emit('get_artifact', {'artifactId' : ARTI.getArtifactId()});
    socket.on('send_artifact', function (data) {
        console.log(data);
        artifactData = new Artifact(data);
        console.log(artifactData);
        ARTI.readyForProcessing();
    });

    $('#save-artifact').on('click', function(){
        var uri = ARTI.getCanvasDataURI(),
            artifactId = ARTI.getArtifactId();
        socket.emit('save_artifact', {uri : uri, artifactId : artifactId});
    });
    
});