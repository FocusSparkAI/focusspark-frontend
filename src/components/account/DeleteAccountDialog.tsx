import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface DeleteAccountDialogProps {
  open: boolean;
  step: number;
  onOpenChange: (open: boolean) => void;
  onStepChange: (step: number) => void;
  onDelete: () => void;
}

export function DeleteAccountDialog({
  open,
  step,
  onOpenChange,
  onStepChange,
  onDelete,
}: DeleteAccountDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) onStepChange(1);
  };

  const handleCancel = () => {
    onOpenChange(false);
    onStepChange(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-none overflow-hidden border-2 border-red-500/30 bg-card p-0"
        style={{ width: 'min(560px, calc(100vw - 32px))' }}
      >
        <motion.div
          animate={step === 2 ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-6 px-8 pb-6 pt-8"
        >
          <DialogHeader className="gap-5 pr-8 text-left">
            <DialogTitle className="flex items-start gap-4 text-2xl leading-tight text-red-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              {step === 1 ? 'Delete Account?' : 'Are you absolutely sure?'}
            </DialogTitle>
            <DialogDescription className="text-base leading-7 text-secondary">
              {step === 1 ? (
                <div className="space-y-4">
                  <p>Deleting your account will permanently remove all stored data including:</p>
                  <ul className="ml-5 list-disc space-y-2">
                    <li>All focus session history</li>
                    <li>Reports and progress data</li>
                    <li>Achievements and badges</li>
                    <li>Focus session records</li>
                    <li>AI chat history</li>
                  </ul>
                  <p className="font-semibold text-red-400">This action cannot be undone.</p>
                </div>
              ) : (
                <p className="font-semibold leading-8 text-red-400">
                  This is your final confirmation. All your data will be permanently deleted. There is no way to recover it.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 border-t border-border/70 pt-4 sm:justify-end">
            <Button variant="outline" onClick={handleCancel} className="min-w-28">
              Cancel
            </Button>
            <Button onClick={onDelete} className="min-w-40 bg-red-500 hover:bg-red-600">
              {step === 1 ? 'Continue' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
