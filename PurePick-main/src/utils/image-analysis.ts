import { Socket } from "socket.io-client";
import { toast } from "sonner";
import { formatDate } from "@/utils/date";
import { scanBarcode } from "@/utils/barcode";
import { AuthStatus, BarcodeInfo, ImageData } from "@/types/scanner.types";
import { useScanStore } from "@/zustand/useScanStore";

// ==============================
// VERIFY USER AUTH
// ==============================
export const verifyUserAuth = (
  socket: Socket,
  userId: string
): Promise<AuthStatus> => {
  return new Promise((resolve) => {

    if (!socket.connected) {
      socket.connect();
    }

  socket.emit("verify-user-auth", userId);
socket.once("user-auth-response", (data: any) => {
    resolve({ authenticated: data.authenticated });
});
    // Safety timeout
    setTimeout(() => {
      resolve({ authenticated: null });
    }, 5000);

  });
};

// ==============================
// PROCESS IMAGES
// ==============================
export const dataUrlToFile = async (
  dataUrl: string,
  filename: string
): Promise<File | undefined> => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch {
    return undefined;
  }
};

export const processImages = async (
  images: (File | string)[]
): Promise<ImageData[]> => {

  let imageData: ImageData[] = [];

  for (const image of images) {
    let file: File | undefined;
    let fileName: string | undefined;
    let barcodeInfo: BarcodeInfo[] = [];

    if (image instanceof File) {
      file = image;
      fileName = image.name;
    } else if (typeof image === "string") {
      const fileDate = formatDate();
      const newFile = await dataUrlToFile(image, `image-${fileDate}.jpg`);
      if (newFile) {
        file = newFile;
        fileName = newFile.name;
      } else {
        toast.error("Something went wrong. Please try again.");
        continue;
      }
    }

    if (file && fileName) {
      // ✅ Convert File to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // strip prefix
        };
        reader.readAsDataURL(file!);
      });

      imageData.push({
        file: base64,  // ✅ base64 string
        fileName,
        barcodeInfo,
      });
    }
  }

  return imageData;
};

// ==============================
// UPLOAD IMAGES
// ==============================
export const uploadImages = (
  socket: Socket,
  imageData: ImageData[]
) => {
  socket.emit("upload-images", imageData);
};
