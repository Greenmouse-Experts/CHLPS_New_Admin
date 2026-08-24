import { AppIcons } from "@/utils/assets/app_icons";
import Image from "next/image";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-black/60 z-[3000]">
      <div className="relative flex flex-col items-center justify-center">
        <div className="w-24 h-24 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>

        <Image
          src={AppIcons.logo}
          alt="Logo"
          className="absolute w-14 h-14 animate-zoomInOut"
          width={50}
          height={50}
          priority
        />
      </div>
      <style>
        {`
          @keyframes zoomInOut {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          .animate-zoomInOut {
            animation: zoomInOut 1s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingOverlay;
