import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isMobileDevice, getDeviceType, isTouchDevice, getViewportDimensions } from "../utils.tsx";

interface DeviceInfo {
  isMobile: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  isTouch: boolean;
  viewport: { width: number; height: number };
}

const useDevice = () => {
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => ({
    isMobile: isMobileDevice(),
    deviceType: getDeviceType(),
    isTouch: isTouchDevice(),
    viewport: getViewportDimensions()
  }));

  // Update device info on window resize
  const handleResize = useCallback(() => {
    setDeviceInfo({
      isMobile: isMobileDevice(),
      deviceType: getDeviceType(),
      isTouch: isTouchDevice(),
      viewport: getViewportDimensions()
    });
  }, []);

  // Set up resize listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Check if device is mobile and redirect if not
  const checkMobileDevice = useCallback(() => {
    if (!deviceInfo.isMobile) {
      navigate('/invalid-device');
      return false;
    }
    return true;
  }, [deviceInfo.isMobile, navigate]);

  // Force redirect to invalid device page
  const redirectToInvalidDevice = useCallback(() => {
    navigate('/invalid-device');
  }, [navigate]);

  // Hook that can be used in components to check mobile device
  const useMobileCheck = useCallback(() => {
    useEffect(() => {
      checkMobileDevice();
    }, [checkMobileDevice]);

    return deviceInfo.isMobile;
  }, [checkMobileDevice, deviceInfo.isMobile]);

  return {
    ...deviceInfo,
    checkMobileDevice,
    redirectToInvalidDevice,
    useMobileCheck
  };
};

export default useDevice;
