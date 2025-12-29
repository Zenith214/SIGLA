"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Camera, ArrowLeft, Save, Eye, EyeOff, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Profile Info State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Barangay Logo State (for officers)
  const [barangayLogo, setBarangayLogo] = useState<string | null>(null);
  const [barangayName, setBarangayName] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Validate password in real-time
  useEffect(() => {
    setPasswordValidation({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    });
  }, [newPassword]);

  useEffect(() => {
    if (user) {
      console.log('[Profile] User data:', JSON.stringify(user, null, 2));
      console.log('[Profile] Role:', user.role);
      console.log('[Profile] Barangay Designation:', user.barangayDesignation);
      console.log('[Profile] Has barangayDesignation property:', 'barangayDesignation' in user);
      console.log('[Profile] Should show logo section:', user.role?.toLowerCase() === 'officer' && user.barangayDesignation);
      
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setProfilePicture(user.profilePicture || null);
      
      // Fetch barangay info if user is an officer with designation
      if (user.role?.toLowerCase() === 'officer' && user.barangayDesignation) {
        fetchBarangayInfo(user.barangayDesignation);
      }
    }
  }, [user]);
  
  const fetchBarangayInfo = async (barangayId: number) => {
    try {
      const response = await fetch(`/api/barangays/${barangayId}`);
      if (response.ok) {
        const data = await response.json();
        setBarangayName(data.name || data.barangay_name);
        setBarangayLogo(data.logo_url || null);
      }
    } catch (error) {
      console.error('Failed to fetch barangay info:', error);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[Profile] File selected:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
    
    if (!file) {
      console.log('[Profile] No file selected');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[Profile] File too large:', file.size, 'bytes');
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error('[Profile] Invalid file type:', file.type);
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    console.log('[Profile] Converting image to base64...');
    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      console.log('[Profile] Image converted to base64, length:', base64String.length);
      setProfilePicture(base64String);
    };
    reader.onerror = (error) => {
      console.error('[Profile] FileReader error:', error);
    };
    reader.readAsDataURL(file);
  };

  const handleBarangayLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('[Profile] Barangay logo file selected:', file?.name);
    
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('barangay_id', user?.barangayDesignation?.toString() || '');

      const uploadResponse = await fetch('/api/barangays/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      const uploadData = await uploadResponse.json();
      const logoUrl = uploadData.logo_url;

      // Update barangay with new logo URL
      const updateResponse = await fetch(`/api/barangays/${user?.barangayDesignation}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo_url: logoUrl,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update barangay logo');
      }

      setBarangayLogo(logoUrl);
      
      toast({
        title: "Success",
        description: "Barangay logo updated successfully",
      });
    } catch (error) {
      console.error('Barangay logo upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload barangay logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveBarangayLogo = async () => {
    if (!barangayLogo) return;

    setIsUploadingLogo(true);

    try {
      // Update barangay to remove logo URL
      const updateResponse = await fetch(`/api/barangays/${user?.barangayDesignation}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo_url: null,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to remove barangay logo');
      }

      setBarangayLogo(null);
      
      toast({
        title: "Success",
        description: "Barangay logo removed successfully",
      });
    } catch (error) {
      console.error('Barangay logo removal error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove barangay logo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUpdateProfile = async () => {
    console.log('[Profile] Starting profile update...');
    console.log('[Profile] Data:', {
      firstName,
      lastName,
      profilePictureLength: profilePicture?.length || 0,
    });
    
    setIsUpdatingProfile(true);
    
    try {
      const payload = {
        firstName,
        lastName,
        profilePicture,
      };
      
      console.log('[Profile] Sending request to /api/user/profile');
      console.log('[Profile] Payload size:', JSON.stringify(payload).length, 'bytes');
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('[Profile] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Profile] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      console.log('[Profile] Profile updated successfully');
      
      // Refresh user data to show new profile picture
      console.log('[Profile] Refreshing user data...');
      await refreshUser();
      console.log('[Profile] User data refreshed');
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('[Profile] Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Enhanced password validation
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one uppercase letter",
        variant: "destructive",
      });
      return;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one lowercase letter",
        variant: "destructive",
      });
      return;
    }

    // Check for number
    if (!/[0-9]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one number",
        variant: "destructive",
      });
      return;
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "Password must contain at least one special character (!@#$%^&* etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }

  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-lg sm:text-xl font-semibold text-white">
                  My Profile
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                        {profilePicture ? (
                          <Image
                            src={profilePicture}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-600">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="profile-picture"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                      >
                        <Camera className="w-4 h-4" />
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Click the camera icon to upload a new picture (max 5MB)
                    </p>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact your administrator if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={user?.role || ""}
                      disabled
                      className="bg-gray-100 capitalize"
                    />
                  </div>

                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Barangay Logo Section - Only for Officers */}
              {user?.role?.toLowerCase() === 'officer' && user?.barangayDesignation && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Barangay Logo</CardTitle>
                    <CardDescription>
                      Upload your barangay logo to personalize reports and dashboards
                      {barangayName && ` for ${barangayName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Barangay Logo Display */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                          {barangayLogo ? (
                            <Image
                              src={barangayLogo}
                              alt="Barangay Logo"
                              width={192}
                              height={192}
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <div className="text-4xl font-bold text-gray-400 mb-2">BLGU</div>
                              <p className="text-sm text-gray-500">No logo uploaded</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          {barangayLogo && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleRemoveBarangayLogo}
                              disabled={isUploadingLogo}
                              className="shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <label
                            htmlFor="barangay-logo"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-lg text-sm font-medium flex items-center"
                          >
                            {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                            <input
                              id="barangay-logo"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleBarangayLogoChange}
                              disabled={isUploadingLogo}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          This logo will appear on your barangay reports and dashboard
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended: Square image, max 5MB (PNG, JPG, or SVG)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-xs space-y-1 mt-2">
                      <p className="font-medium text-gray-700">Password must contain:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.minLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least 8 characters</span>
                        </li>
                        <li className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasUppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one uppercase letter (A-Z)</span>
                        </li>
                        <li className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasLowercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one lowercase letter (a-z)</span>
                        </li>
                        <li className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one number (0-9)</span>
                        </li>
                        <li className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordValidation.hasSpecialChar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>At least one special character (!@#$%^&* etc.)</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isChangingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
