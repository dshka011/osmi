import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Store, Phone, Mail, MapPin, Globe, QrCode, Link2, Clock, Camera, X, Upload, Download } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Restaurant, CURRENCIES, DEFAULT_WORKING_HOURS, WorkingHours, DAY_NAMES } from '../../types';

const RestaurantManager: React.FC = () => {
  const { t } = useLanguage();
  const { 
    restaurants, 
    selectedRestaurant, 
    createRestaurant, 
    updateRestaurant, 
    deleteRestaurant, 
    selectRestaurant,
    getPublicMenuUrl,
    getCurrencySymbol,
    formatWorkingHours,
    importMenuFromCSV,
    generateQRCode
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvImportStatus, setCSVImportStatus] = useState<string>('');
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [qrRestaurant, setQRRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    currency: 'RUB',
    logo: '',
    photo: '',
    workingHours: DEFAULT_WORKING_HOURS
  });
  const [formError, setFormError] = useState<string>('');
  const [formLoading, setFormLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  const handleWorkingHoursChange = (day: keyof WorkingHours, field: keyof WorkingHours[keyof WorkingHours], value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant.id, formData);
      } else {
        await createRestaurant(formData);
      }
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Ошибка при создании ресторана');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      currency: 'RUB',
      logo: '',
      photo: '',
      workingHours: DEFAULT_WORKING_HOURS
    });
    setLogoPreview('');
    setPhotoPreview('');
    setIsFormOpen(false);
    setEditingRestaurant(null);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      address: restaurant.address || '',
      website: restaurant.website || '',
      currency: restaurant.currency || 'RUB',
      logo: restaurant.logo || '',
      photo: restaurant.photo || '',
      workingHours: restaurant.workingHours || DEFAULT_WORKING_HOURS
    });
    setLogoPreview(restaurant.logo || '');
    setPhotoPreview(restaurant.photo || '');
    setIsFormOpen(true);
  };

  const handleDelete = (restaurant: Restaurant) => {
    if (window.confirm(t('restaurant.delete.confirm', { name: restaurant.name }))) {
      deleteRestaurant(restaurant.id);
    }
  };

  const copyMenuLink = (restaurantId: string) => {
    const url = getPublicMenuUrl(restaurantId);
    navigator.clipboard.writeText(url);
    alert(t('restaurant.linkCopied'));
  };

  const handleQRCode = async (restaurant: Restaurant) => {
    try {
      setQRRestaurant(restaurant);
      const qrCode = await generateQRCode(restaurant.id);
      setQRCodeData(qrCode);
      setIsQRModalOpen(true);
    } catch (error) {
      alert(t('qr.error'));
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData && qrRestaurant) {
      const link = document.createElement('a');
      link.download = `${qrRestaurant.name}-menu-qr.png`;
      link.href = qrCodeData;
      link.click();
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCSVFile(file);
      setCSVImportStatus(t('restaurant.csvImport.selectFile'));
    } else {
      setCSVImportStatus(t('restaurant.csvImport.selectFile'));
    }
  };

  const handleCSVImport = async () => {
    if (!csvFile || !selectedRestaurant) return;

    try {
      setCSVImportStatus('Importing...');
      const csvContent = await csvFile.text();
      await importMenuFromCSV(selectedRestaurant.id, csvContent);
      setCSVImportStatus(t('restaurant.csvImport.success'));
      setCSVFile(null);
      setTimeout(() => {
        setIsCSVImportOpen(false);
        setCSVImportStatus('');
      }, 2000);
    } catch (error) {
      setCSVImportStatus(error instanceof Error ? error.message : t('restaurant.csvImport.error'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('restaurant.title')}</h1>
          <p className="text-gray-600">{t('restaurant.subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          {selectedRestaurant && (
            <button
              onClick={() => setIsCSVImportOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('restaurant.csvImport')}
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('restaurant.add')}
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQRModalOpen && qrCodeData && qrRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">{t('qr.title', { name: qrRestaurant.name })}</h2>
            <div className="mb-4">
              <img
                src={qrCodeData}
                alt="QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {t('qr.description')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('qr.download')}
              </button>
              <button
                onClick={() => {
                  setIsQRModalOpen(false);
                  setQRCodeData('');
                  setQRRestaurant(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCSVImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('restaurant.csvImport.title')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('restaurant.csvImport.description')}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {t('restaurant.csvImport.example')}
                </p>
                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      const csvContent = `category,name,description,price,tags
Закуски,Брускетта,Хрустящий хлеб с томатами и базиликом,450,вегетарианское,итальянское
Закуски,Карпаччо,Тонко нарезанная говядина с пармезаном,650,мясное,итальянское
Основные блюда,Стейк Рибай,Сочный стейк из говядины с овощами,1200,мясное,премиум
Десерты,Тирамису,Классический итальянский десерт,450,сладкое,итальянское`;
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'example-menu.csv';
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('restaurant.csvImport.downloadExample')}
                  </button>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {csvImportStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  csvImportStatus.includes('success') 
                    ? 'bg-green-100 text-green-700' 
                    : csvImportStatus.includes('failed') || csvImportStatus.includes('error')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {csvImportStatus}
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCSVImport}
                  disabled={!csvFile || csvImportStatus.includes('Importing')}
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('restaurant.csvImport.button')}
                </button>
                <button
                  onClick={() => {
                    setIsCSVImportOpen(false);
                    setCSVFile(null);
                    setCSVImportStatus('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {editingRestaurant ? t('restaurant.edit') : t('restaurant.create')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.name.required')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('restaurant.name.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.currency.required')}
                  </label>
                  <select
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                      <option key={code} value={code}>
                        {symbol} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={t('restaurant.description.placeholder')}
                />
              </div>

              {/* Logo and Photo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.logo.upload')}
                  </label>
                  <div className="space-y-3">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">{t('restaurant.logo.upload')}</p>
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                          <Camera className="w-4 h-4 mr-2" />
                          {t('restaurant.logo.choose')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('restaurant.photo.upload')}
                  </label>
                  <div className="space-y-3">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Photo Preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">{t('restaurant.photo.upload')}</p>
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                          <Camera className="w-4 h-4 mr-2" />
                          {t('restaurant.photo.choose')}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('restaurant.phone.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('restaurant.email.placeholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.address')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('restaurant.address.placeholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.website')}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('restaurant.website.placeholder')}
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('restaurant.workingHours')}
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-3">
                    {Object.entries(DAY_NAMES).map(([day, dayName]) => (
                      <div key={day} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-4">
                          <div className="w-28 text-sm font-medium text-gray-700">
                            {dayName}
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.workingHours[day as keyof WorkingHours].isOpen}
                              onChange={(e) => handleWorkingHoursChange(day as keyof WorkingHours, 'isOpen', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">{t('common.open')}</span>
                          </label>
                        </div>
                        {formData.workingHours[day as keyof WorkingHours].isOpen && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={formData.workingHours[day as keyof WorkingHours].openTime}
                              onChange={(e) => handleWorkingHoursChange(day as keyof WorkingHours, 'openTime', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-500">—</span>
                            <input
                              type="time"
                              value={formData.workingHours[day as keyof WorkingHours].closeTime}
                              onChange={(e) => handleWorkingHoursChange(day as keyof WorkingHours, 'closeTime', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{formError}</div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? t('common.saving') : (editingRestaurant ? t('restaurant.update') : t('restaurant.create'))}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restaurant List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
              selectedRestaurant?.id === restaurant.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => selectRestaurant(restaurant)}
          >
            {/* Restaurant Photo */}
            {restaurant.photo && (
              <div className="h-48 overflow-hidden">
                <img
                  src={restaurant.photo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {restaurant.logo ? (
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedRestaurant?.id === restaurant.id ? t('restaurant.activeRestaurant') : t('common.clickToSelect')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('common.currencyLabel')}: {getCurrencySymbol(restaurant.currency || 'RUB')} {restaurant.currency || 'RUB'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(restaurant);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(restaurant);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {restaurant.description && (
                <p className="text-gray-600 text-sm mb-4">{restaurant.description}</p>
              )}

              <div className="space-y-2 mb-4">
                {restaurant.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{restaurant.email}</span>
                  </div>
                )}
                {restaurant.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{restaurant.website}</span>
                  </div>
                )}
                {restaurant.workingHours && (
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 mt-0.5" />
                    <span className="leading-relaxed">{formatWorkingHours(restaurant.workingHours)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyMenuLink(restaurant.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  {t('restaurant.copyLink')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQRCode(restaurant);
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  {t('restaurant.qrCode')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('restaurant.noRestaurants')}</h3>
          <p className="text-gray-500 mb-6">{t('restaurant.noRestaurants.description')}</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('restaurant.addFirst')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantManager;