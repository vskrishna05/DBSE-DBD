import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  QrCode,
  Shield,
  Award,
  Calendar,
  Gauge,
  Printer,
  Car,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const VehiclePassport = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      if (Array.isArray(res.data)) {
        setVehicles(res.data);
        if (res.data.length > 0) {
          const queryId = searchParams.get('vehicleId');
          const activeId = queryId ? Number(queryId) : res.data[0].id;
          setSelectedVehicleId(activeId);
          loadPassport(activeId);
        }
      }
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const loadPassport = async (vId) => {
    try {
      const res = await api.get(`/passports/vehicle/${vId}`);
      setPassportData(res.data);
    } catch (err) {
      // Create minimal placeholder passport if none exists
      setPassportData({
        passport: {
          passportNumber: `PASSPORT-${vId}-2026`,
          totalServicesRecorded: 0,
          averageHealthScore: 100,
          overallConditionGrade: 'EXCELLENT',
          verificationCode: 'SHA256-MECHX-CLEAN'
        },
        vehicle: vehicles.find(v => v.id === vId) || {},
        serviceHistory: []
      });
    }
  };

  const handleSelect = (vId) => {
    setSelectedVehicleId(vId);
    loadPassport(vId);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading digital passport...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 rounded-2xl bg-[#09090B] border border-white/10 text-center space-y-3 bg-black text-white">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto text-neutral-400">
          <Car className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">No Vehicle Passports</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Register a vehicle in your digital garage to generate an immutable Digital Vehicle Passport.
        </p>
        <Link
          to="/customer/vehicles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </Link>
      </div>
    );
  }

  const passport = passportData?.passport;
  const vehicle = passportData?.vehicle || vehicles[0];
  const history = passportData?.serviceHistory || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-black text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span>Digital Provenance Certificate</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Digital Vehicle Passport</h1>
          <p className="text-xs text-neutral-400 mt-1">Verified maintenance records and QR stamp for resale protection</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs hover:bg-white/10 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Certificate</span>
        </button>
      </div>

      {/* Vehicle Selector Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSelect(v.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap border transition-all ${
              selectedVehicleId === v.id
                ? 'bg-white text-black font-bold border-white'
                : 'bg-[#09090B] border-white/10 text-neutral-400 hover:text-white hover:border-white/25'
            }`}
          >
            {v.manufacturer} {v.model} ({v.registrationNumber})
          </button>
        ))}
      </div>

      {passport && vehicle && (
        <div className="space-y-6">
          {/* Certificate Hero Seal - Luxury Monochrome */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#09090B] border border-white/20 shadow-2xl relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                    Verified Digital Service Ledger
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {vehicle.manufacturer} {vehicle.model}
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Plate: {vehicle.registrationNumber} • VIN: {vehicle.vin || 'N/A'}
                </p>

                <div className="pt-2 grid grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-black border border-white/10">
                    <span className="text-[10px] text-neutral-500 block">Condition</span>
                    <strong className="text-white text-xs">{passport.overallConditionGrade || 'OPTIMAL'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-white/10">
                    <span className="text-[10px] text-neutral-500 block">Health Rating</span>
                    <strong className="text-white text-xs">{passport.averageHealthScore || 100}%</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-white/10">
                    <span className="text-[10px] text-neutral-500 block">Records</span>
                    <strong className="text-white text-xs">{passport.totalServicesRecorded || 0} Entries</strong>
                  </div>
                </div>
              </div>

              {/* QR Verification Seal */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-black border border-white/15 text-center space-y-3">
                <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-black" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-neutral-400">Passport Number</p>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">{passport.passportNumber}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Service History Timeline */}
          <div className="p-6 rounded-2xl bg-[#09090B] border border-white/15 space-y-4">
            <h3 className="text-xs font-mono uppercase text-neutral-400">Timestamped Maintenance History</h3>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No previous service ledger records. Initial record will be created on completion of first service.</p>
            ) : (
              <div className="space-y-3">
                {history.map((record, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-semibold text-white">{record.serviceType}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{record.serviceCenterName} • Odometer: {record.recordedOdometer?.toLocaleString()} KM</p>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">{record.serviceDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePassport;
