import Webcam from "react-webcam";

const Camera = () => {
    return (
        <Webcam 
        audio={false}
        mirrored={false}
        screenshotFormat="image/jpeg"
        style={{
        width: "100%",
        borderRadius: "12px",
        }}
        videoConstraints={{
            width: 1280,
            height: 720,
        }}/>
    )
}
export default Camera;