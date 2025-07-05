import { UserProfile } from '@clerk/clerk-react';

const Settings = () => {
  return (
    <div className="flex w-full justify-center px-4 py-6">
        <UserProfile 
          appearance={{
            variables: {
              colorPrimary: "#6366f1", // primary-500
              colorBackground: "#ffffff", // Light mode background
              colorText: "#5f172f", // slate-900 for text
              colorTextSecondary: "#64748b", // slate-500 for secondary text
              colorTextOnPrimaryBackground: "#ffffff",
              
              // Input styling
              colorInputBackground: "#ffffff",
              colorInputText: "#0f172a",
              
              colorShimmer: "#e2e8f0", // slate-200
              
              // Neutral colors
              colorNeutral: "#64748b",
              colorDanger: "#ef4444",
              colorSuccess: "#10b981",
              colorWarning: "#f59e0b",
            },
            elements: {
              card: {
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                borderRadius: "0",
              },
              
              // Header styling
              headerTitle: {
                fontSize: "1.5rem",
                fontWeight: "600",
                background: "linear-gradient(to right, #6366f1, #4f46e5)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              },
              headerSubtitle: {
                color: "#64748b",
              },
              
              // Navigation tabs
              navbarButton: {
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              },
              
              // Form elements
              formFieldInput: {
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
                padding: "0.75rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                "&:focus": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                },
              },
              formFieldLabel: {
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
              },
              
              // Buttons
              formButtonPrimary: {
                backgroundColor: "#6366f1",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#4f46e5",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              },
              formButtonSecondary: {
                backgroundColor: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  borderColor: "#cbd5e1",
                },
              },
              
              // Profile image
              avatarBox: {
                borderRadius: "9999px",
                border: "3px solid #6366f1",
                overflow: "hidden",
              },
              
              // Modal styling
              modalContent: {
                borderRadius: "1rem",
                border: "1px solid #e2e8f0",
              },
              
              // Page content
              page: {
                padding: "2rem",
              },
              
              // Profile section
              profileSection: {
                padding: "1.5rem 0",
                borderBottom: "1px solid #e2e8f0",
              },
              profileSectionTitle: {
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.5rem",
              },
              profileSectionContent: {
                color: "#6b7280",
              },
            },
          }}
        />
    </div>
  );
};

export default Settings;