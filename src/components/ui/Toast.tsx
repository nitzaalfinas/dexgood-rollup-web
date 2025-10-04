import { Slide, ToastContainer } from "react-toastify";

const Toast = () => {
  const getToastClassName = (context: any) => {
    const baseClass =
      "flex items-center p-4 rounded-lg shadow-3xl min-w-[300px] max-w-md border bg-[#1D2838]";

    switch (context?.type) {
      case "success":
        return `${baseClass} border-success-text`;
      case "error":
        return `${baseClass} border-danger-text`;
      case "warning":
        return `${baseClass} border-warning-text`;
      default:
        return `${baseClass} justify-center border-gray-600`;
    }
  };

  return (
    <ToastContainer
      toastClassName={getToastClassName}
      closeButton={false}
      position="top-center"
      transition={Slide}
      hideProgressBar
    />
  );
};

export default Toast;
