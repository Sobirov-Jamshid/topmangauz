import toast from "react-hot-toast";

type ToastType = "success" | "error" | "loading";

export const showToast = (
  message: string,
  type: ToastType = "success",
  duration?: number
) => {
  switch (type) {
    case "success":
      return toast.success(message, { duration });
    case "error":
      return toast.error(message, { duration });
    case "loading":
      return toast.loading(message, { duration });
    default:
      return toast(message, { duration });
  }
}; 