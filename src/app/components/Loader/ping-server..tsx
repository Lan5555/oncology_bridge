import LottieAnimation from "../lottie";
import Defi from "../../assets/Defi.json";

const PingServerLoader = () => {
  return (
    <div className="w-full h-screen bg-blue-950 flex justify-center items-center flex-col gap-2">
      <LottieAnimation animation={Defi} loop={true}></LottieAnimation>
      <h2 className="text-white">Loading Server...</h2>
    </div>
  );
};
export default PingServerLoader;
