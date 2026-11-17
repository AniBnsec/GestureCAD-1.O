import React, { useState } from 'react';
import { useCadStore } from '../../store/useCadStore';
import { ComponentItem } from '../../types';
import {
  Layers,
  Search,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Sparkles,
  Cpu,
  Fan,
  Battery,
  Camera,
  Box,
  Compass,
  Radio,
  Navigation,
  Video,
  Bell,
  Shield,
  Activity,
  Trash2,
  X,
  Check,
  Wrench,
  Download
} from 'lucide-react';

interface PresetHardware {
  name: string;
  type: ComponentItem['type'];
  weightGrams: number;
  count: number;
  description: string;
  icon: string;
}

const PRESET_HARDWARE: PresetHardware[] = [
  {
    name: 'GPS & Compass Module',
    type: 'sensor',
    weightGrams: 18,
    count: 1,
    description: 'u-blox M8N Mini GLONASS/GPS receiver with high-precision digital compass for autonomous navigation.',
    icon: 'gps',
  },
  {
    name: '5.8GHz 1W VTX Transmitter',
    type: 'avionics',
    weightGrams: 14,
    count: 1,
    description: 'High-power 5.8GHz analog/digital video downlink transmitter with Pagoda circular polarized antenna.',
    icon: 'vtx',
  },
  {
    name: 'HD Action Camera Mount',
    type: 'payload',
    weightGrams: 28,
    count: 1,
    description: 'Vibration-damped 30° angled TPU aerodynamic protective cage for 4K action cameras.',
    icon: 'actioncam',
  },
  {
    name: 'Autonomous Finder Buzzer',
    type: 'avionics',
    weightGrams: 4,
    count: 1,
    description: '105dB self-powered acoustic emergency lost-model alarm with bright flashing strobe LED.',
    icon: 'buzzer',
  },
  {
    name: '2.4GHz Diversity Long-Range RX',
    type: 'avionics',
    weightGrams: 3,
    count: 1,
    description: 'ExpressLRS / Crossfire ultra low-latency telemetry receiver with dual dipole diversity antennas.',
    icon: 'receiver',
  },
  {
    name: 'Carbon Fiber Landing Skids',
    type: 'frame',
    weightGrams: 32,
    count: 1,
    description: '4-point angled 3K carbon fiber landing gear struts with shock-absorbing silicone footpads.',
    icon: 'landing',
  },
  {
    name: 'Obstacle Avoidance Micro LiDAR',
    type: 'sensor',
    weightGrams: 12,
    count: 1,
    description: 'High-speed Time-of-Flight optical proximity rangefinder sensor (0.1m - 12m operating range).',
    icon: 'lidar',
  },
];

export const ComponentSidebar: React.FC = () => {
  const {
    components,
    selectedComponentId,
    setSelectedComponentId,
    toggleComponentVisibility,
    addComponentCount,
    removeComponentCount,
    addNewComponent,
    removeComponent,
    resetComponents,
    sendAiMessage,
    config,
  } = useCadStore();

  const [activeTab, setActiveTab] = useState<'components' | 'assembly'>('components');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'presets' | 'custom'>('presets');

  // Custom component form state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<ComponentItem['type']>('sensor');
  const [customWeight, setCustomWeight] = useState(15);
  const [customCount, setCustomCount] = useState(1);
  const [customDesc, setCustomDesc] = useState('');

  const filteredComponents = components.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedComp = components.find((c) => c.id === selectedComponentId);

  // Total All-Up Weight (AUW) calculation
  const totalAUW = components
    .filter((c) => c.visible !== false)
    .reduce((sum, c) => sum + (c.weightGrams * c.count), 0);

  const totalParts = components.reduce((sum, c) => sum + c.count, 0);

  const getIcon = (type: ComponentItem['type'], name: string = '') => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gps')) return <Navigation className="w-4 h-4 text-emerald-400" />;
    if (lowerName.includes('vtx') || lowerName.includes('transmitter')) return <Radio className="w-4 h-4 text-rose-400" />;
    if (lowerName.includes('action') || lowerName.includes('gopro')) return <Video className="w-4 h-4 text-purple-400" />;
    if (lowerName.includes('buzzer') || lowerName.includes('alarm')) return <Bell className="w-4 h-4 text-amber-400" />;
    if (lowerName.includes('landing') || lowerName.includes('skid')) return <Shield className="w-4 h-4 text-sky-400" />;
    if (lowerName.includes('lidar') || lowerName.includes('rangefinder')) return <Activity className="w-4 h-4 text-teal-400" />;

    switch (type) {
      case 'frame':
        return <Box className="w-4 h-4 text-[#00C8FF]" />;
      case 'motor':
        return <Fan className="w-4 h-4 text-emerald-400" />;
      case 'propeller':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'battery':
        return <Battery className="w-4 h-4 text-amber-400" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-purple-400" />;
      case 'flight_controller':
        return <Cpu className="w-4 h-4 text-rose-400" />;
      case 'sensor':
        return <Activity className="w-4 h-4 text-teal-400" />;
      case 'payload':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'avionics':
        return <Radio className="w-4 h-4 text-amber-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleAddPreset = (preset: PresetHardware) => {
    // Check if component already exists
    const existing = components.find(
      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
    );

    if (existing) {
      addComponentCount(existing.id);
    } else {
      addNewComponent({
        name: preset.name,
        type: preset.type,
        weightGrams: preset.weightGrams,
        count: preset.count,
        description: preset.description,
        visible: true,
        custom: true,
      });
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addNewComponent({
      name: customName.trim(),
      type: customType,
      weightGrams: Number(customWeight) || 10,
      count: Number(customCount) || 1,
      description: customDesc.trim() || `Custom ${customType} hardware item for UAV airframe`,
      visible: true,
      custom: true,
    });

    // Reset form
    setCustomName('');
    setCustomDesc('');
    setCustomWeight(15);
    setCustomCount(1);
    setIsAddModalOpen(false);
  };

  const handleExportBOM = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Component Name,Category,Quantity,Unit Weight (g),Total Weight (g),Status\n' +
      components
        .map(
          (c) =>
            `"${c.id}","${c.name}","${c.type}",${c.count},${c.weightGrams},${c.count * c.weightGrams},"${c.visible ? 'Active' : 'Hidden'}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AeroX4_Bill_of_Materials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-80 h-full bg-[#07111F]/95 border-r border-[#00C8FF]/20 flex flex-col backdrop-blur-md relative select-none">
      {/* Top Header & Navigation Tabs */}
      <div className="p-3 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-1 bg-black/30 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('components')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'components'
                ? 'bg-[#1677FF] text-white shadow-hologram'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Components ({components.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'assembly'
                ? 'bg-[#1677FF] text-white shadow-hologram'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Assembly & BOM</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parts, avionics, sensors..."
            className="w-full bg-[#10233B]/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]/60 transition-colors"
          />
        </div>

        {/* High-Visibility "Add Component" Action Trigger */}
        <div className="mt-2.5 flex items-center space-x-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold text-xs flex items-center justify-center space-x-1.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-hologram"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Component</span>
          </button>

          <button
            onClick={resetComponents}
            title="Reset component inventory to defaults"
            className="p-2 rounded-xl bg-[#10233B]/60 border border-white/10 text-slate-400 hover:text-white hover:border-[#00C8FF]/40 transition-colors text-xs"
          >
            <Wrench className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'components' ? (
          filteredComponents.length > 0 ? (
            filteredComponents.map((comp) => {
              const isSelected = comp.id === selectedComponentId;
              const isDefaultPart = [
                'c-frame',
                'c-motors',
                'c-props',
                'c-battery',
                'c-camera',
                'c-fc',
                'c-gps',
                'c-vtx',
                'c-landing',
              ].includes(comp.id);

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComponentId(isSelected ? null : comp.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#1677FF]/20 border-[#00C8FF] shadow-hologram'
                      : 'bg-[#10233B]/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 shrink-0">
                        {getIcon(comp.type, comp.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-semibold text-white truncate">{comp.name}</span>
                          {comp.custom && (
                            <span className="text-[9px] px-1 py-0.2 bg-[#00C8FF]/20 text-[#00C8FF] font-mono rounded">
                              MOD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
                          <span>Qty: {comp.count}</span>
                          <span>·</span>
                          <span className="text-slate-300">{comp.weightGrams * comp.count}g</span>
                          <span className="text-slate-600">({comp.weightGrams}g ea)</span>
                        </div>
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleComponentVisibility(comp.id)}
                        title={comp.visible ? 'Hide from 3D View' : 'Show in 3D View'}
                        className={`p-1 rounded-md transition-colors ${
                          comp.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {comp.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Decrement */}
                      <button
                        onClick={() => removeComponentCount(comp.id)}
                        className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                        title="Reduce quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Increment */}
                      <button
                        onClick={() => addComponentCount(comp.id)}
                        className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      {/* Delete Custom Component */}
                      {!isDefaultPart && (
                        <button
                          onClick={() => removeComponent(comp.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded-md hover:bg-rose-500/20 transition-colors ml-0.5"
                          title="Remove component from assembly"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching components found.
            </div>
          )
        ) : (
          /* Assembly & BOM Tab */
          <div className="space-y-3">
            {/* Real-Time All-Up Weight Matrix */}
            <div className="p-3 bg-[#10233B]/60 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">All-Up Weight (AUW)</span>
                <span className="text-sm font-bold font-mono text-[#00C8FF]">{totalAUW} g</span>
              </div>
              {/* Weight Progress Bar */}
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-300 ${
                    totalAUW > 950 ? 'bg-rose-500' : totalAUW > 750 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalAUW / 1000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Total Items: {totalParts} units</span>
                <span>Payload Margin: {Math.max(0, 1100 - totalAUW)}g</span>
              </div>
            </div>

            {/* Assembly Joints & Mechanical Constraints */}
            <div className="p-3 bg-[#10233B]/40 rounded-xl border border-white/5 text-xs space-y-2">
              <div className="font-semibold text-[#00C8FF]">Mechanical Hierarchy</div>
              <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                <div className="flex justify-between p-1.5 bg-black/20 rounded-lg">
                  <span>Carbon Unibody Fuselage</span>
                  <span className="text-emerald-400">Structural Deck</span>
                </div>
                <div className="flex justify-between p-1.5 bg-black/20 rounded-lg">
                  <span>4x Radial Arms (45° Diagonal)</span>
                  <span className="text-emerald-400">{config.armLength} mm cantilever</span>
                </div>
                <div className="flex justify-between p-1.5 bg-black/20 rounded-lg">
                  <span>4x Brushless Outrunners</span>
                  <span className="text-cyan-400">{config.motorSize} mm Stator</span>
                </div>
                <div className="flex justify-between p-1.5 bg-black/20 rounded-lg">
                  <span>Tri-Blade Propellers</span>
                  <span className="text-cyan-400">{config.propellerSize}" Airfoil</span>
                </div>
                <div className="flex justify-between p-1.5 bg-black/20 rounded-lg">
                  <span>Avionics & Payload Modules</span>
                  <span className="text-purple-400">{components.length - 4} Active Nodes</span>
                </div>
              </div>
            </div>

            {/* Export BOM Action */}
            <button
              onClick={handleExportBOM}
              className="w-full py-2 bg-[#10233B]/80 hover:bg-[#1677FF]/30 border border-[#00C8FF]/30 hover:border-[#00C8FF] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-hologram"
            >
              <Download className="w-3.5 h-3.5 text-[#00C8FF]" />
              <span>Export BOM (.CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Component Inspection Card */}
      {selectedComp && (
        <div className="p-3 bg-[#080D17] border-t border-[#00C8FF]/30 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#00C8FF] uppercase tracking-wide truncate mr-2">
              Selected: {selectedComp.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5 shrink-0">
              {selectedComp.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2 line-clamp-2">
            {selectedComp.description}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => sendAiMessage(`Explain the technical function, aerodynamic role, and mounting constraints of the ${selectedComp.name}.`)}
              className="flex-1 py-1.5 bg-[#1677FF]/20 hover:bg-[#1677FF]/30 text-[#00C8FF] border border-[#00C8FF]/40 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Analysis</span>
            </button>
            {!['c-frame', 'c-motors', 'c-props', 'c-battery', 'c-camera', 'c-fc', 'c-gps', 'c-vtx', 'c-landing'].includes(selectedComp.id) && (
              <button
                onClick={() => removeComponent(selectedComp.id)}
                className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg transition-colors"
                title="Delete component"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ADD COMPONENT DRAWER / MODAL OVERLAY                            */}
      {/* ================================================================ */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-50 bg-[#07111F]/98 backdrop-blur-xl flex flex-col border-r border-[#00C8FF]/30 animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#00C8FF]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Add Drone Component</span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-3 pb-0">
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setAddMode('presets')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  addMode === 'presets'
                    ? 'bg-[#1677FF] text-white shadow-hologram'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hardware Library
              </button>
              <button
                onClick={() => setAddMode('custom')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  addMode === 'custom'
                    ? 'bg-[#1677FF] text-white shadow-hologram'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Part
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {addMode === 'presets' ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  1-Click Aerospace Modules
                </div>
                {PRESET_HARDWARE.map((preset) => {
                  const isAlreadyAdded = components.some(
                    (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                  );
                  return (
                    <div
                      key={preset.name}
                      className="p-2.5 rounded-xl bg-[#10233B]/50 border border-white/5 hover:border-[#00C8FF]/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                            {getIcon(preset.type, preset.name)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{preset.name}</div>
                            <div className="text-[10px] font-mono text-[#00C8FF]">
                              +{preset.weightGrams}g · {preset.type}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddPreset(preset)}
                          className="px-2.5 py-1 rounded-lg bg-[#1677FF] hover:bg-[#00C8FF] text-white hover:text-[#07111F] text-xs font-bold flex items-center space-x-1 transition-all shadow-hologram"
                        >
                          {isAlreadyAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>+1 Qty</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Custom Component Form */
              <form onSubmit={handleCreateCustom} className="space-y-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Define Custom Hardware Spec
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Thermal Imaging Pod"
                    className="w-full bg-[#10233B]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as any)}
                      className="w-full bg-[#10233B]/80 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                    >
                      <option value="sensor">Sensor</option>
                      <option value="avionics">Avionics</option>
                      <option value="payload">Payload</option>
                      <option value="frame">Frame / Structural</option>
                      <option value="battery">Battery / Power</option>
                      <option value="camera">Camera</option>
                      <option value="motor">Motor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Unit Weight (g)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={customWeight}
                      onChange={(e) => setCustomWeight(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#10233B]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00C8FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCustomCount(Math.max(1, customCount - 1))}
                      className="p-2 bg-[#10233B] border border-white/10 rounded-xl text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-mono text-xs font-bold text-white">
                      {customCount} unit{customCount > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomCount(customCount + 1)}
                      className="p-2 bg-[#10233B] border border-white/10 rounded-xl text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Engineering Description
                  </label>
                  <textarea
                    rows={2}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Enter electrical specifications, mounting orientation, or payload purpose..."
                    className="w-full bg-[#10233B]/80 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00C8FF] text-[#07111F] font-bold text-xs flex items-center justify-center space-x-1.5 hover:brightness-110 shadow-hologram"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add to Assembly</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
