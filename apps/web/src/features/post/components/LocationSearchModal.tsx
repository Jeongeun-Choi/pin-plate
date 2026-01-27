interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationSearchModal = ({ isOpen, onClose }: LocationSearchModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2>장소 검색</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <p>장소 검색 기능이 곧 구현될 예정입니다.</p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            marginTop: '20px',
            cursor: 'pointer',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default LocationSearchModal;
