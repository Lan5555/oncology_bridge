import Lottie from "lottie-react";

interface LottieProps {
    animation: any;
    loop: boolean;
    width?: number;
    height?: number;
}
const LottieAnimation:React.FC<LottieProps> = ({animation, loop, width = 300, height = 300}) => {
    return (
        <div style={{width: width, height: height}}>
        <Lottie animationData={animation} loop={loop}></Lottie>
        </div>
    )
}
export default LottieAnimation;