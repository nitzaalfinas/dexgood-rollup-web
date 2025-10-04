import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateMarketModalProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: number) => void;
  rootCoinSymbol: string;
}

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
  open,
  onClose,
  onSelectType,
}) => {
  return (
    <Modal 
      open={open} 
      onClose={onClose}
      title="Create Market"
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-gray-400 mb-6">
          Choose the type of market you want to create
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => onSelectType(1)}
            className="w-full justify-start"
            variant="outline"
          >
            <div className="text-left">
              <div className="font-semibold">Basic Market</div>
              <div className="text-sm text-gray-400">Create a simple trading market</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onSelectType(2)}
            className="w-full justify-start"
            variant="outline"
          >
            <div className="text-left">
              <div className="font-semibold">Advanced Market</div>
              <div className="text-sm text-gray-400">Create market with advanced features</div>
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateMarketModal;