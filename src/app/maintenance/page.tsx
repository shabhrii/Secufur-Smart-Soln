import { ShieldAlert } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl border p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Marketplace Under Maintenance</h1>
        <p className="text-muted-foreground mb-8">
          We are currently performing scheduled maintenance to improve the platform. 
          Please check back shortly. We appreciate your patience!
        </p>
      </div>
    </div>
  );
}
