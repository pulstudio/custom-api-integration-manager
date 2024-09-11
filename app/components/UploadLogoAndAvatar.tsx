'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Avatar from 'react-avatar';

interface UploadLogoAndAvatarProps {
  onLogoUpload: (logo: string) => void;
  onAvatarUpload: (avatar: string) => void;
}

const UploadLogoAndAvatar: React.FC<UploadLogoAndAvatarProps> = ({ onLogoUpload, onAvatarUpload }) => {
  const [companyLogo, setCompanyLogo] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleLogoDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCompanyLogo(result);
      onLogoUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      onAvatarUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps: getLogoProps, getInputProps: getLogoInputProps } = useDropzone({ onDrop: handleLogoDrop });
  const { getRootProps: getAvatarProps, getInputProps: getAvatarInputProps } = useDropzone({ onDrop: handleAvatarDrop });

  return (
    <div className="upload-container">
      <div className="logo-section mb-8">
        <h3 className="text-lg font-semibold mb-2">Company Logo</h3>
        <div {...getLogoProps()} className="upload-logo-area border-2 border-dashed p-4 mb-4 cursor-pointer">
          <input {...getLogoInputProps()} />
          <p>Drag & drop a company logo, or click to select a file</p>
        </div>
        {companyLogo && <img src={companyLogo} alt="Company Logo" className="uploaded-logo max-w-xs mb-4" />}
      </div>

      <div className="avatar-section">
        <h3 className="text-lg font-semibold mb-2">User Avatar</h3>
        <div {...getAvatarProps()} className="upload-avatar-area border-2 border-dashed p-4 mb-4 cursor-pointer">
          <input {...getAvatarInputProps()} />
          <p>Drag & drop an avatar, or click to select a profile picture</p>
        </div>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="uploaded-avatar w-24 h-24 rounded-full" />
        ) : (
          <Avatar name="User Name" size="100" round={true} />
        )}
      </div>
    </div>
  );
};

export default UploadLogoAndAvatar;