"use client";

import { Modal, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export default function PdfViewerModal({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  title = "PDF Ko'rish" 
}: PdfViewerModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-white">{title}</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="text-white hover:text-gray-300"
          />
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ maxWidth: "1200px" }}
      className="pdf-viewer-modal"
      styles={{
        body: { 
          padding: 0, 
          height: "80vh",
          backgroundColor: "#1a1a1a"
        },
        header: {
          backgroundColor: "#2a2a2a",
          borderBottom: "1px solid #333"
        }
      }}
    >
      <div className="w-full h-full">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="PDF Viewer"
            onError={() => {
              // Silent fail
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <p className="text-lg mb-4">fayl topilmadi</p>
              <p className="text-gray-400">URL: {pdfUrl || 'URL berilmagan'}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
