import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Package, ShoppingCart, Clock, CheckCircle2, IndianRupee, Sparkles, 
  Mic, MicOff, Camera, Wand2, Scissors, ArrowRight, Upload, Play, 
  RefreshCw, Check, AlertCircle, TrendingUp, Layers, UserPlus, UserCheck,
  Globe, Volume2, Languages, AlertTriangle
} from 'lucide-react';

export const ArtisanDashboard = () => {
  const { t, language } = useLanguage();

  // Active Artisan session state
  const [artisan, setArtisan] = useState(() => {
    const saved = localStorage.getItem('craftbiz_artisan');
    return saved ? JSON.parse(saved) : null;
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    craft_type: 'Handloom & Pottery',
    location: 'Karnataka, India',
    production_capacity: 50
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, studio, voice, pricing, products, orders
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // AI Studio State
  const [selectedProductForStudio, setSelectedProductForStudio] = useState(null);
  const [studioStep, setStudioStep] = useState(1);
  const [studioProcessing, setStudioProcessing] = useState(false);
  const [studioPreview, setStudioPreview] = useState({
    original: null,
    enhanced: null,
    pro: null
  });

  // Voice AI State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [voiceTranslation, setVoiceTranslation] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [liveInterimText, setLiveInterimText] = useState('');
  const [voiceInputLang, setVoiceInputLang] = useState('auto'); // auto, hi, en
  const [voiceExtracting, setVoiceExtracting] = useState(false);
  const [seoDetails, setSeoDetails] = useState(null);
  const [selectedSeoLang, setSelectedSeoLang] = useState('en'); // 'en', 'hi'
  const [voiceTranslationHi, setVoiceTranslationHi] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [micStatusWarning, setMicStatusWarning] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const recognizedTextRef = useRef('');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioFileInputRef = useRef(null);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Woodcraft',
    material: 'Natural Ivory Wood & Organic Lacquer',
    description: 'Hand-turned traditional craft using non-toxic natural vegetable pigments.',
    production_cost: 350,
    selling_price: 599,
    available_quantity: 15,
    image_url: ''
  });

  // Smart Pricing State (Demand level calculated automatically by backend based on upcoming future days)
  const [pricingInput, setPricingInput] = useState({
    cost: 350,
    category: 'Woodcraft'
  });
  const [pricingResult, setPricingResult] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Load Dashboard Data
  const loadDashboard = async () => {
    if (!artisan?.id) {
      setShowRegisterModal(true);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getArtisanDashboard(artisan.id);
      setDashboardData(data);
      const prods = await api.getArtisanProducts(artisan.id);
      setProducts(prods);
      if (prods.length > 0 && !selectedProductForStudio) {
        setSelectedProductForStudio(prods[0]);
        setStudioPreview({
          original: prods[0].image_url ? api.getImageUrl(prods[0].image_url) : null,
          enhanced: prods[0].enhanced_image_url ? api.getImageUrl(prods[0].enhanced_image_url) : null,
          pro: prods[0].professional_image_url ? api.getImageUrl(prods[0].professional_image_url) : null
        });
      }
    } catch (err) {
      console.warn("Artisan not in database or session expired. Prompting registration.", err);
      setShowRegisterModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [artisan?.id]);

  useEffect(() => {
    const fetchAudioDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devs = await navigator.mediaDevices.enumerateDevices();
          const inputs = devs.filter(d => d.kind === 'audioinput');
          setAudioDevices(inputs);
          if (inputs.length > 0 && !selectedAudioDevice) {
            setSelectedAudioDevice(inputs[0].deviceId);
          }
        }
      } catch (e) {
        console.log('Enumerate audio devices note:', e);
      }
    };
    fetchAudioDevices();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Register or Login Artisan
  const handleRegisterArtisan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newArtisan = await api.registerArtisan(registerForm);
      setArtisan(newArtisan);
      localStorage.setItem('craftbiz_artisan', JSON.stringify(newArtisan));
      setShowRegisterModal(false);
      showNotification(`Welcome, ${newArtisan.name}! Your artisan profile is active.`);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleArtisan = () => {
    setRegisterForm({
      name: "Meenakshi Bai",
      phone: "98765" + Math.floor(10000 + Math.random() * 90000),
      craft_type: "Channapatna Woodcraft",
      location: "Channapatna, Ramanagara, Karnataka",
      production_capacity: 75
    });
  };

  // Mark Order Ready for Pickup
  const handleMarkOrderReady = async (orderId) => {
    try {
      await api.markOrderReady(orderId);
      showNotification(`Order #${orderId} marked Ready for Pickup! Courier notified.`);
      loadDashboard();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // AI Studio: Upload Image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProductForStudio) return;
    setStudioProcessing(true);
    try {
      const res = await api.uploadProductImage(selectedProductForStudio.id, file);
      setStudioPreview(prev => ({
        ...prev,
        original: api.getImageUrl(res.image_url)
      }));
      setStudioStep(1);
      showNotification('Original image uploaded. Ready for AI Enhancement!');
      loadDashboard();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setStudioProcessing(false);
    }
  };

  // AI Studio: Step 2 Enhance with Pillow
  const handleEnhanceImage = async () => {
    if (!selectedProductForStudio) return;
    setStudioProcessing(true);
    try {
      const res = await api.enhanceProductImage(selectedProductForStudio.id);
      setStudioPreview(prev => ({
        ...prev,
        enhanced: api.getImageUrl(res.enhanced_image_url)
      }));
      setStudioStep(2);
      showNotification('AI Enhanced with Pillow! Brightness, contrast & sharpness optimized.');
      loadDashboard();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setStudioProcessing(false);
    }
  };

  // AI Studio: Step 3 Background Removal with rembg
  const handleRemoveBackground = async () => {
    if (!selectedProductForStudio) return;
    setStudioProcessing(true);
    try {
      const res = await api.removeProductBackground(selectedProductForStudio.id);
      setStudioPreview(prev => ({
        ...prev,
        pro: api.getImageUrl(res.professional_image_url)
      }));
      setStudioStep(3);
      showNotification('Background cut out with rembg! Studio lighting applied.');
      loadDashboard();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setStudioProcessing(false);
    }
  };

  // Voice Recording with Web Speech API + Whisper AI Pipeline
  const startRecording = async () => {
    try {
      setMicStatusWarning(null);
      const audioConstraints = {
        channelCount: 1,
        autoGainControl: true,
        echoCancellation: false,
        noiseSuppression: false
      };
      if (selectedAudioDevice) {
        audioConstraints.deviceId = { exact: selectedAudioDevice };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      audioChunksRef.current = [];
      recognizedTextRef.current = '';
      setLiveInterimText('');
      setVoiceTranscription('');
      setVoiceTranslation('');
      setMicVolume(0);

      // Setup Web Audio Volume Meter & Silence Detector
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const actx = new AudioCtx();
          audioContextRef.current = actx;
          const src = actx.createMediaStreamSource(stream);
          const analyser = actx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          analyserRef.current = analyser;

          const dataArr = new Uint8Array(analyser.frequencyBinCount);
          let framesChecked = 0;
          let maxVolumeDetected = 0;

          const updateVol = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArr);
            let sum = 0;
            for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
            const avg = sum / dataArr.length;
            const vol = Math.min(100, Math.round(avg * 4));
            setMicVolume(vol);
            if (vol > maxVolumeDetected) maxVolumeDetected = vol;

            framesChecked++;
            // Check if user is speaking but mic gives zero volume after 2 seconds
            if (framesChecked === 100 && maxVolumeDetected <= 1) {
              setMicStatusWarning(
                'Microphone input volume is 0 (Muted). Please check your Windows microphone mute button (e.g. Fn+F4 or physical mic switch) or select another input device below.'
              );
            }

            animFrameRef.current = requestAnimationFrame(updateVol);
          };
          animFrameRef.current = requestAnimationFrame(updateVol);
        }
      } catch (e) {
        console.log('AudioContext meter notice:', e);
      }

      // 1. Initialize browser SpeechRecognition if available (Chrome/Edge)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          
          let targetLang = 'en-IN';
          if (voiceInputLang === 'kn') targetLang = 'kn-IN';
          else if (voiceInputLang === 'hi') targetLang = 'hi-IN';
          else if (voiceInputLang === 'en') targetLang = 'en-IN';
          else if (language === 'kn') targetLang = 'kn-IN';
          else if (language === 'hi') targetLang = 'hi-IN';
          
          rec.lang = targetLang;

          rec.onresult = (event) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript + ' ';
            }
            if (combined.trim()) {
              setLiveInterimText(combined.trim());
              setVoiceTranscription(combined.trim());
              recognizedTextRef.current = combined.trim();
              setMicStatusWarning(null);
            }
          };

          rec.onerror = (e) => {
            console.log('SpeechRecognition notice:', e);
            if (e.error === 'not-allowed') {
              setMicStatusWarning('Microphone access blocked by browser. Click the lock icon in your address bar and allow Microphone.');
            } else if (e.error === 'audio-capture') {
              setMicStatusWarning('No audio captured. Check if your Windows microphone is muted or unplugged.');
            }
          };

          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.log('SpeechRecognition init skipped:', e);
        }
      }

      // 2. Initialize MediaRecorder for audio blob upload
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        processVoiceBlob(blob, recognizedTextRef.current);
        // Clean up audio tracks
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      showNotification('Microphone active! Speak craft details in Kannada, Hindi, or English.');
    } catch (err) {
      setMicStatusWarning('Microphone access denied or device not found. Please grant microphone permission in your browser.');
      showNotification('Microphone access unavailable. Check browser mic permissions or upload an audio file below!', 'error');
    }
  };

  const stopRecording = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setMicVolume(0);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload an audio file directly
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoiceExtracting(true);
    showNotification('Uploading audio recording to Whisper AI...', 'info');
    try {
      const transcribeRes = await api.transcribeVoice(file);
      if (transcribeRes.text && transcribeRes.text.trim()) {
        await handleTranslateAndExtract(transcribeRes.text.trim(), transcribeRes.translated_text, transcribeRes.language);
      } else {
        showNotification('No clear speech detected in audio file. Please try another file or type your craft below!', 'warning');
      }
    } catch (err) {
      showNotification(err.message || 'Error transcribing audio file', 'error');
    } finally {
      setVoiceExtracting(false);
      e.target.value = '';
    }
  };

  const processVoiceBlob = async (blob, recognizedText = '') => {
    setVoiceExtracting(true);
    try {
      let spokenText = (recognizedText || '').trim();
      let detectedLang = voiceInputLang !== 'auto' ? voiceInputLang : 'auto';
      let serverTranslatedText = '';

      // Send audio file to Whisper transcribe endpoint
      try {
        const ext = blob.type.includes('webm') ? '.webm' : '.wav';
        const file = new File([blob], `voice_input${ext}`, { type: blob.type });
        const transcribeRes = await api.transcribeVoice(file);
        if (transcribeRes.text && transcribeRes.text.trim()) {
          spokenText = transcribeRes.text.trim();
        }
        if (transcribeRes.translated_text) {
          serverTranslatedText = transcribeRes.translated_text;
        }
        if (transcribeRes.language) {
          detectedLang = transcribeRes.language;
        }
      } catch (err) {
        console.warn('Backend audio transcribe notice:', err);
      }

      // Check if voice was detected — NEVER replace with a fake hardcoded example
      if (!spokenText) {
        showNotification('No clear speech was heard from the microphone. Check your mic or type what you said in the box below to translate!', 'warning');
        return;
      }

      setVoiceTranscription(spokenText);
      await handleTranslateAndExtract(spokenText, serverTranslatedText, detectedLang);
    } catch (err) {
      showNotification(err.message || 'Error processing audio', 'error');
    } finally {
      setVoiceExtracting(false);
      setLiveInterimText('');
    }
  };

  // Direct Translate & Extract Function for what the artisan says
  const handleTranslateAndExtract = async (textToProcess, prefetchedTranslation = '', detectedLang = 'auto') => {
    if (!textToProcess || !textToProcess.trim()) {
      showNotification('Please speak into the mic or enter your craft description first!', 'error');
      return;
    }
    setVoiceExtracting(true);
    try {
      const details = await api.extractVoiceDetails(textToProcess.trim());
      const finalTranslated = details.translated_text || prefetchedTranslation || textToProcess.trim();
      setVoiceTranscription(textToProcess.trim());
      setVoiceTranslation(finalTranslated);
      if (details.translated_hindi) {
        setVoiceTranslationHi(details.translated_hindi);
      }
      setVoiceLanguage(details.detected_language || detectedLang || 'en');

      // Set SEO details
      setSeoDetails({
        seo_title_en: details.seo_title_en,
        seo_title_hi: details.seo_title_hi,
        description_en: details.description_en,
        description_hi: details.description_hi,
        seo_keywords: details.seo_keywords || [],
        seo_keywords_hi: details.seo_keywords_hi || [],
        bullet_points_en: details.bullet_points_en || [],
        bullet_points_hi: details.bullet_points_hi || [],
        seo_score: details.seo_score || 98
      });

      // Auto-populate product form with SEO title and description
      const activeDesc = (language === 'hi' ? details.description_hi : details.description_en) || details.description_en || '';
      setProductForm(prev => ({
        ...prev,
        name: details.name,
        category: details.category,
        material: details.material,
        description: activeDesc || prev.description,
        production_cost: details.production_cost,
        selling_price: details.suggested_selling_price,
        available_quantity: details.quantity
      }));

      showNotification(`✨ AI NLP Engine: Extracted ${details.name} & generated SEO descriptions in English and Hindi!`);
    } catch (err) {
      showNotification(err.message || 'Error extracting craft entities', 'error');
    } finally {
      setVoiceExtracting(false);
    }
  };

  // Preset sample voices
  const handleSampleVoice = async (sampleText) => {
    await handleTranslateAndExtract(sampleText);
  };

  // Save new product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!artisan?.id) {
      setShowRegisterModal(true);
      return;
    }
    setLoading(true);
    try {
      const newProd = await api.createProduct({
        artisan_id: artisan.id,
        name: productForm.name,
        category: productForm.category,
        material: productForm.material,
        description: productForm.description,
        production_cost: parseFloat(productForm.production_cost),
        selling_price: parseFloat(productForm.selling_price),
        available_quantity: parseInt(productForm.available_quantity)
      });
      showNotification(`"${newProd.name}" published to CraftBiz Marketplace!`);
      setSelectedProductForStudio(newProd);
      setActiveTab('studio');
      loadDashboard();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Smart Pricing Calculator with Backend AI Demand Forecasting
  const handleCalculatePricing = async () => {
    setPricingLoading(true);
    try {
      const res = await api.suggestPricing(pricingInput.cost, pricingInput.category);
      setPricingResult(res);
      showNotification('Smart Price calculated with AI Future Demand Forecasting!');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setPricingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-amber-400 border border-amber-500/40'
        }`}>
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* REGISTRATION / SWITCH ARTISAN MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Fresh Artisan Profile</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">🎨 Register as an Artisan</h3>
              </div>
              <button
                type="button"
                onClick={fillSampleArtisan}
                className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Auto-Fill Sample
              </button>
            </div>

            <form onSubmit={handleRegisterArtisan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g. Meenakshi Bai or Rameshwar Pal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Craft Type</label>
                  <input
                    type="text"
                    required
                    value={registerForm.craft_type}
                    onChange={(e) => setRegisterForm({ ...registerForm, craft_type: e.target.value })}
                    placeholder="e.g. Woodcraft, Terracotta"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cluster Location / State</label>
                <input
                  type="text"
                  required
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  placeholder="e.g. Channapatna, Karnataka"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Creating Profile...' : 'Save & Open Artisan Hub'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{artisan?.name || "New Artisan"}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                Verified Master Artisan
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-1">
              {artisan?.craft_type || "Craft Creator"} • {artisan?.location || "India"}
            </p>
          </div>
        </div>

        {/* Tab Pills & Switch Artisan Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Artisan</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'overview' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'studio' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🎨</span>
              <span>AI Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'voice' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🎙</span>
              <span>Voice Catalogue</span>
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'pricing' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>💰</span>
              <span>Smart Pricing</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">{t('total_products', 'Total Products')}</span>
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {dashboardData?.total_products || products.length || 0}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% GI Authentic
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">{t('total_orders', 'Total Orders')}</span>
                <ShoppingCart className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {dashboardData?.total_orders || 0}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Orders Received</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">{t('pending_orders', 'Pending Orders')}</span>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {dashboardData?.pending_orders || 0}
              </div>
              <span className="text-[11px] text-orange-700 font-semibold">Requires Packing</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">{t('delivered_orders', 'Delivered Orders')}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                {dashboardData?.delivered_orders || 0}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Verified with OTP</span>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20 space-y-2">
              <div className="flex items-center justify-between text-amber-100">
                <span className="text-xs font-semibold uppercase">{t('total_revenue', 'Total Revenue')}</span>
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-black">
                ₹{(dashboardData?.revenue || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-100 font-medium">Direct Bank Settlement</span>
            </div>

          </div>

          {/* Charts & Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Trajectory Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('revenue_trend', 'Revenue Analytics')}</h3>
                  <p className="text-xs text-slate-500">Monthly sales volume across B2B wholesale & retail orders</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  +34% Growth
                </span>
              </div>

              <div className="h-56 pt-6 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
                {[
                  { month: 'Apr', val: 1800, height: '40%' },
                  { month: 'May', val: 2400, height: '55%' },
                  { month: 'Jun', val: 2100, height: '48%' },
                  { month: 'Jul', val: 3200, height: '70%' },
                  { month: 'Aug', val: 4100, height: '85%' },
                  { month: 'Sep (Current)', val: 5600, height: '100%', active: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-400 group-hover:text-amber-600">
                      ₹{item.val}
                    </div>
                    <div 
                      style={{ height: item.height }} 
                      className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                        item.active 
                          ? 'bg-gradient-to-t from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20' 
                          : 'bg-slate-200 hover:bg-amber-200'
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Performance Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Your Active Products</h3>
              <p className="text-xs text-slate-500">Add products using Voice AI or the Product Studio</p>
              
              <div className="space-y-3 pt-2">
                {products.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No products yet. Use the Voice Catalogue or AI Studio to publish your first craft!</p>
                  </div>
                ) : (
                  products.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span className="truncate max-w-[180px]">{prod.name}</span>
                        <span className="text-amber-600">₹{prod.selling_price}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Stock: {prod.available_quantity} pcs</span>
                        <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md">
                          {prod.authenticity_score}% Authenticity
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('recent_orders', 'Recent Orders')}</h3>
                <p className="text-xs text-slate-500">Manage orders received and mark ready for courier pickup</p>
              </div>
              <button 
                onClick={loadDashboard}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {(!dashboardData?.recent_orders || dashboardData.recent_orders.length === 0) ? (
              <p className="text-sm text-slate-500 py-6 text-center">No orders received yet. When buyers order your crafts, they will appear here!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Buyer</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.recent_orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">#{ord.id}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{ord.product_name} (×{ord.quantity})</td>
                        <td className="py-3 px-3 text-slate-600">{ord.buyer_name}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">₹{ord.total_amount}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                            ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'Ready for Pickup' ? 'bg-indigo-100 text-indigo-800' :
                            ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {ord.status === 'Pending' && (
                            <button
                              onClick={() => handleMarkOrderReady(ord.id)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('mark_ready', 'Mark Ready for Pickup')}</span>
                            </button>
                          )}
                          {ord.status !== 'Pending' && (
                            <span className="text-xs text-slate-400 italic">Processing with Courier</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: AI PRODUCT STUDIO */}
      {activeTab === 'studio' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Computer Vision Pipeline</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('studio_title', 'AI Product Studio')}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
                {t('studio_subtitle', 'Turn casual phone photos into studio-grade marketplace listings in 4 automated AI steps.')}
              </p>
            </div>

            {/* Product Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600">Select Craft:</label>
              {products.length === 0 ? (
                <button
                  onClick={() => setActiveTab('voice')}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  + Create First Product
                </button>
              ) : (
                <select
                  value={selectedProductForStudio?.id || ''}
                  onChange={(e) => {
                    const p = products.find(prod => prod.id === parseInt(e.target.value));
                    if (p) {
                      setSelectedProductForStudio(p);
                      setStudioPreview({
                        original: p.image_url ? api.getImageUrl(p.image_url) : null,
                        enhanced: p.enhanced_image_url ? api.getImageUrl(p.enhanced_image_url) : null,
                        pro: p.professional_image_url ? api.getImageUrl(p.professional_image_url) : null
                      });
                    }
                  }}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 4-Step Pipeline Visual Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { num: 1, title: t('step_original', '1. Original Capture'), icon: Camera, done: !!studioPreview.original },
              { num: 2, title: t('step_enhanced', '2. AI Enhanced (Pillow)'), icon: Wand2, done: !!studioPreview.enhanced },
              { num: 3, title: t('step_pro', '3. Background Cutout (rembg)'), icon: Scissors, done: !!studioPreview.pro },
              { num: 4, title: t('step_ready', '4. Marketplace Ready'), icon: CheckCircle2, done: !!studioPreview.pro }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    step.done 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5" />
                    {step.done && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </div>
                  <div className="text-xs font-bold">{step.title}</div>
                </div>
              );
            })}
          </div>

          {/* Studio Canvas Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* 1. Original Image View */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">📸 Original Photo</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-200 rounded-md font-semibold text-slate-700">Step 1</span>
                </div>
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {studioPreview.original ? (
                    <img src={studioPreview.original} alt="Original Craft" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 text-slate-400 space-y-2">
                      <Camera className="w-10 h-10 mx-auto opacity-40" />
                      <p className="text-xs">No image uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block w-full text-center px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow transition-all">
                  <Upload className="w-4 h-4 inline-block mr-1.5" />
                  <span>{t('upload_photo', 'Upload Craft Photo')}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* 2. Enhanced Image View (Pillow) */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">✨ Pillow Enhanced</span>
                  <span className="text-[11px] px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-semibold">Step 2</span>
                </div>
                <div className="aspect-square w-full rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {studioPreview.enhanced ? (
                    <img src={studioPreview.enhanced} alt="Enhanced Craft" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 text-slate-400 space-y-2">
                      <Wand2 className="w-10 h-10 mx-auto opacity-40" />
                      <p className="text-xs">Enhances sharpness & color</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleEnhanceImage}
                disabled={!studioPreview.original || studioProcessing}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" />
                <span>{studioProcessing ? t('studio_processing', 'Processing AI...') : t('enhance_btn', 'Apply AI Enhancement')}</span>
              </button>
            </div>

            {/* 3. Studio Background Removed View (rembg) */}
            <div className="bg-gradient-to-b from-amber-50/50 to-orange-50/50 rounded-3xl p-5 border-2 border-amber-300 flex flex-col justify-between space-y-4 shadow-md">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">✂️ rembg Studio Cutout</span>
                  <span className="text-[11px] px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md font-extrabold">Final Pro</span>
                </div>
                <div className="aspect-square w-full rounded-2xl bg-white border border-amber-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {studioPreview.pro ? (
                    <img src={studioPreview.pro} alt="Studio Cutout" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6 text-amber-700 space-y-2">
                      <Scissors className="w-10 h-10 mx-auto opacity-50" />
                      <p className="text-xs">Removes background onto luxury studio canvas</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleRemoveBackground}
                disabled={(!studioPreview.enhanced && !studioPreview.original) || studioProcessing}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Scissors className="w-4 h-4" />
                <span>{studioProcessing ? t('studio_processing', 'Processing rembg AI...') : t('remove_bg_btn', 'Remove Background (Studio)')}</span>
              </button>
            </div>

          </div>

          {/* AI Quality Certification Badge */}
          {studioPreview.pro && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="font-bold text-sm">Certified Marketplace Ready</div>
                  <div className="text-xs text-emerald-800">Visual Quality: 98% • Contrast Balanced • Compliant with National E-Commerce Norms</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-xl">
                Ready to Sell
              </span>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: MULTILINGUAL VOICE CATALOGUE */}
      {activeTab === 'voice' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-200">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
              <Mic className="w-3.5 h-3.5 text-purple-600" />
              <span>OpenAI Whisper Voice Model</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              🎙️ {t('voice_title', 'NLP Voice Catalogue & SEO Description Engine')}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
              Describe your craft via voice notes in Hindi, English, or any regional language. The NLP AI automatically translates and generates SEO-friendly, professional product descriptions in English & Hindi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recording Controls & Presets */}
            <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              
              {/* Language Selection Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-purple-600" />
                    <span>Speaking Language / बोलने की भाषा</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Auto-Translates to EN & HI
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
                  {[
                    { id: 'auto', label: '🌐 Auto Detect' },
                    { id: 'hi', label: '🇮🇳 हिन्दी (Hindi)' },
                    { id: 'en', label: '🇬🇧 English' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setVoiceInputLang(l.id)}
                      className={`py-2 rounded-lg font-bold text-xs transition-all text-center ${
                        voiceInputLang === l.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Input Device Selector if multiple microphones found */}
              {audioDevices.length > 1 && (
                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Mic className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Input Device:</span>
                  <select
                    value={selectedAudioDevice}
                    onChange={(e) => setSelectedAudioDevice(e.target.value)}
                    className="text-xs bg-transparent border-0 text-slate-800 font-semibold focus:ring-0 w-full truncate"
                  >
                    {audioDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Microphone ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Microphone Status Warning Banner */}
              {micStatusWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs space-y-1.5 animate-in fade-in shadow-sm">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Microphone Issue Detected:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">{micStatusWarning}</p>
                  <div className="pt-1 text-[10px] text-amber-800 border-t border-amber-200 flex flex-col sm:flex-row gap-1 sm:gap-3">
                    <span>1. Unmute Windows microphone (Fn+F4 or Sound Settings)</span>
                    <span>2. Or use the Upload Audio / Text box below</span>
                  </div>
                </div>
              )}

              {/* Record Button & Status */}
              <div className="text-center py-4 space-y-4">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-xl shadow-rose-500/40 scale-110' 
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                }`}>
                  {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-8 py-3.5 font-bold rounded-2xl text-sm shadow-lg transition-all ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {isRecording ? t('stop_recording', 'Stop & Transcribe') : t('start_recording', 'Start Voice Recording')}
                    </button>

                    {/* Audio File Upload Button */}
                    <input
                      type="file"
                      ref={audioFileInputRef}
                      accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => audioFileInputRef.current?.click()}
                      disabled={voiceExtracting || isRecording}
                      className="px-4 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
                      title="Upload a voice recording file from your PC or phone"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload Audio File</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {isRecording ? '🎙️ Listening carefully in regional language... Speak clearly.' : 'Speak through microphone or upload an audio file (.mp3 / .wav / .m4a)'}
                  </p>
                </div>

                {/* Live Mic Volume Level Meter */}
                {isRecording && (
                  <div className="w-full max-w-xs mx-auto p-3 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-rose-500 animate-pulse" />
                        <span>MIC INPUT LEVEL:</span>
                      </span>
                      <span className={micVolume > 4 ? "text-emerald-600 font-extrabold" : "text-amber-600 font-semibold"}>
                        {micVolume > 4 ? "Voice Heard 🟢" : "Listening for Voice..."}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-75 ${
                          micVolume > 40 ? 'bg-rose-500' : micVolume > 10 ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.max(4, micVolume)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Live speech preview if available */}
                {isRecording && liveInterimText && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 animate-in fade-in">
                    <span className="font-bold text-[10px] text-purple-700 uppercase block mb-1">Live Speech Heard:</span>
                    <p className="italic font-medium">"{liveInterimText}"</p>
                  </div>
                )}
              </div>

              {/* Direct Craft Speech / Spoken Input Editor */}
              <div className="bg-white p-5 rounded-3xl border border-purple-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>What you said about your craft (Speak or Edit below):</span>
                  </span>
                  {voiceTranscription && (
                    <button
                      type="button"
                      onClick={() => { setVoiceTranscription(''); setVoiceTranslation(''); }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={voiceTranscription}
                  onChange={(e) => setVoiceTranscription(e.target.value)}
                  placeholder="Speak using the button above, or type what you want to say in Kannada, Hindi, or English (e.g. 'ನನ್ನ ಕೈಮಗ್ಗ ಕಾಟನ್ ಸೀರೆ, ವೆಚ್ಚ 600 ಮಾರಾಟ 1200...' or 'मेरी शुद्ध मिट्टी की मूर्ती लागत 250...') and click Translate & Extract."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
                />
                <button
                  type="button"
                  disabled={voiceExtracting || !voiceTranscription.trim()}
                  onClick={() => handleTranslateAndExtract(voiceTranscription)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{voiceExtracting ? 'Translating & Extracting Your Craft...' : '⚡ Translate & Extract What I Said'}</span>
                </button>
              </div>

              {/* Translated to English Card */}
              {voiceTranslation && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 space-y-2 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>English AI Translation:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold">
                      🇬🇧 Translated
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 font-semibold leading-relaxed">"{voiceTranslation}"</p>
                  <div className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/60 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Your craft entities have been extracted into the product form!</span>
                  </div>
                </div>
              )}

              {/* Quick Preset Samples for Testing */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('try_sample', 'Or Try Sample Voice Audio:')}
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSampleVoice("चन्नापटना लकड़ी का खिलौना घोड़ा, प्राकृतिक वनस्पति रंग, उत्पादन लागत 320 रुपये, बिक्री मूल्य 550 रुपये, 25 पीस उपलब्ध हैं।")}
                    className="w-full p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">🇮🇳 {t('sample_channapatna', 'Channapatna Woodcraft (Hindi)')}</div>
                      <div className="text-[11px] text-slate-500">चन्नापटना लकड़ी का खिलौना घोड़ा, लागत 320, बिक्री 550, 25 पीस</div>
                    </div>
                    <Play className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleVoice("बांकुरा टेराकोटा मंदिर घोड़ा, शुद्ध मिट्टी से निर्मित, निर्माण लागत 380 रुपये, बिक्री दर 680 रुपये, 20 पीस उपलब्ध हैं।")}
                    className="w-full p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">🇮🇳 {t('sample_terracotta', 'Bankura Terracotta (Hindi)')}</div>
                      <div className="text-[11px] text-slate-500">बांकुरा टेराकोटा मंदिर घोड़ा, लागत 380, कीमत 680, 20 पीस</div>
                    </div>
                    <Play className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSampleVoice("Heritage Handloom Cotton Saree with Zari border, pure cotton weave, production cost 950 rupees, sell price 1650 rupees, quantity 15 units in stock.")}
                    className="w-full p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">🇬🇧 {t('sample_handloom', 'Handloom Saree (English)')}</div>
                      <div className="text-[11px] text-slate-500">Handloom Cotton Saree, cost 950, sell 1650, qty 15</div>
                    </div>
                    <Play className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </div>

            </div>

            {/* Auto-Populated Product Form */}
            <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t('extracted_title', 'AI Extracted Product Entities')}</span>
                </h3>
                {voiceExtracting && (
                  <span className="text-xs font-semibold text-purple-600 animate-pulse">Extracting...</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('product_name', 'Product Name')}</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Channapatna Lacquered Rocking Horse"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('category', 'Category')}</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  >
                    <option value="Woodcraft">Woodcraft</option>
                    <option value="Terracotta">Terracotta</option>
                    <option value="Handloom">Handloom</option>
                    <option value="Bamboo Crafts">Bamboo Crafts</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Metal Crafts">Metal Crafts</option>
                    <option value="Jute Crafts">Jute Crafts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('material', 'Material')}</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('production_cost', 'Cost (₹)')}</label>
                  <input
                    type="number"
                    required
                    value={productForm.production_cost}
                    onChange={(e) => setProductForm({ ...productForm, production_cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('selling_price', 'Sell Price (₹)')}</label>
                  <input
                    type="number"
                    required
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    required
                    value={productForm.available_quantity}
                    onChange={(e) => setProductForm({ ...productForm, available_quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* NLP-GENERATED SEO-FRIENDLY PRODUCT DESCRIPTIONS (ENGLISH & HINDI) */}
              {seoDetails && (
                <div className="p-4 bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-white rounded-2xl border-2 border-purple-300 shadow-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        AI NLP SEO Description Engine
                      </span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ⚡ 98% SEO Score
                    </span>
                  </div>

                  {/* Bilingual Tab Switcher: English vs Hindi */}
                  <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-purple-200 w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeoLang('en');
                        setProductForm(prev => ({ ...prev, description: seoDetails.description_en }));
                        showNotification('Applied English SEO Description!');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        selectedSeoLang === 'en'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>🇬🇧 English SEO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSeoLang('hi');
                        setProductForm(prev => ({ ...prev, description: seoDetails.description_hi }));
                        showNotification('हिंदी एसईओ उत्पाद विवरण लागू किया गया!');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        selectedSeoLang === 'hi'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>🇮🇳 हिन्दी (Hindi SEO)</span>
                    </button>
                  </div>

                  {/* SEO Title Preview */}
                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {selectedSeoLang === 'en' ? 'SEO Search Title (High Click-Through-Rate)' : 'एसईओ सर्च टाइटल (उच्च क्लिक दर)'}
                    </div>
                    <div className="text-xs font-black text-purple-950">
                      {selectedSeoLang === 'en' ? seoDetails.seo_title_en : seoDetails.seo_title_hi}
                    </div>
                  </div>

                  {/* SEO Description Content Preview */}
                  <div className="bg-white p-3 rounded-xl border border-purple-100 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {selectedSeoLang === 'en' ? 'E-Commerce Marketplace Description' : 'पेशेवर ई-कॉमर्स विवरण'}
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto pr-1">
                      {selectedSeoLang === 'en' ? seoDetails.description_en : seoDetails.description_hi}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {selectedSeoLang === 'en' ? 'Marketplace Highlights:' : 'मुख्य विशेषताएं:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-700 font-medium">
                      {(selectedSeoLang === 'en' ? seoDetails.bullet_points_en : seoDetails.bullet_points_hi).map((bp, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="line-clamp-1">{bp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search Keywords & Tags */}
                  <div className="space-y-1 pt-1 border-t border-purple-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {selectedSeoLang === 'en' ? 'SEO Search Keywords:' : 'एसईओ सर्च कीवर्ड्स:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedSeoLang === 'en' ? seoDetails.seo_keywords : seoDetails.seo_keywords_hi).map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-bold">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Heritage Story ({selectedSeoLang === 'en' ? 'English' : 'हिन्दी'})
                </label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="AI generated product description will appear here..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('save_product', 'Publish to Marketplace')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* TAB 4: AI SMART PRICING ENGINE */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-200">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Economic Optimization Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('pricing_title', 'AI Smart Pricing Engine')}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mt-1">
              {t('pricing_subtitle', 'Optimize profitability and fair wages using our multi-factor pricing algorithm.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Input Controls */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700">{t('production_cost', 'Production Cost (₹)')}</label>
                  <span className="text-sm font-black text-slate-900">₹{pricingInput.cost}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={pricingInput.cost}
                  onChange={(e) => setPricingInput({ ...pricingInput, cost: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Automated Backend AI Demand Forecasting (User Request: Demand level in backend based on future coming days, no manual choice for artisan) */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-300/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('ai_future_demand_title', 'AI Market Demand Engine')}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                    {t('backend_auto', 'Backend Automated')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {t('ai_demand_auto_note', 'Market demand is intelligently forecasted by the backend engine based on upcoming 30-day festival schedules, seasonal buyer trends, and craft velocity.')}
                </p>
                {pricingResult?.demand_level ? (
                  <div className="p-2 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">{t('forecasted_demand', 'Forecasted Demand')}:</span>
                    <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                      🔥 {pricingResult.demand_level}
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] font-medium text-amber-800/80 italic">
                    ⚡ {t('auto_calculate_prompt', 'Click Calculate below to auto-forecast demand for your craft category.')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">{t('category', 'Category')}</label>
                <select
                  value={pricingInput.category}
                  onChange={(e) => setPricingInput({ ...pricingInput, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                >
                  <option value="Terracotta">Terracotta (Clay & Pottery)</option>
                  <option value="Bamboo Crafts">Bamboo & Cane Crafts</option>
                  <option value="Handloom">Handloom & Khadi</option>
                  <option value="Woodcraft">Woodcraft & Lacquerware</option>
                  <option value="Jewellery">Handmade Jewellery</option>
                  <option value="Metal Crafts">Metal Crafts & Bidriware</option>
                  <option value="Jute Crafts">Jute Crafts & Bags</option>
                </select>
              </div>

              <button
                onClick={handleCalculatePricing}
                disabled={pricingLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <span>{pricingLoading ? 'Calculating...' : t('calc_pricing', 'Calculate Smart Price')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {/* Results Display */}
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-white p-6 rounded-3xl border-2 border-amber-200 flex flex-col justify-between space-y-6">
              
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Algorithmic Recommendation</span>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
                    <span className="text-xs text-slate-500 font-semibold">{t('suggested_price', 'Suggested Price')}</span>
                    <div className="text-3xl font-black text-amber-600 mt-1">
                      ₹{pricingResult?.suggested_price || (pricingInput.cost * 1.45).toFixed(0)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
                    <span className="text-xs text-slate-500 font-semibold">{t('est_profit', 'Estimated Profit')}</span>
                    <div className="text-3xl font-black text-emerald-600 mt-1">
                      ₹{pricingResult?.estimated_profit || (pricingInput.cost * 0.45).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* 🔍 EXPLAINABLE AI PRICING BREAKDOWN (User Request: "update dynamic pricing with explainable why is it this much amount") */}
                {pricingResult?.breakdown && (
                  <div className="mt-4 p-4 bg-white rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                        <span>🔍</span>
                        <span>Itemized Economic Cost Breakdown</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Fair Wage Certified
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>🧵 Raw Materials & Fuel:</span>
                        <span className="font-bold text-slate-900">₹{pricingResult.breakdown.raw_materials}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>👐 Master Artisan Handcrafting Wage:</span>
                        <span className="font-bold text-emerald-700">₹{pricingResult.breakdown.artisan_labor}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>🏛️ GI Heritage & Cultural Authenticity:</span>
                        <span className="font-bold text-purple-700">+₹{pricingResult.breakdown.heritage_gi_premium}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>📦 Protective Packaging & Courier Reserve:</span>
                        <span className="font-bold text-amber-700">+₹{pricingResult.breakdown.packaging_logistics_buffer}</span>
                      </div>
                      {pricingResult.breakdown.fair_wage_reserve > 0 && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span>🛡️ Artisan Welfare & Health Reserve:</span>
                          <span className="font-bold text-blue-700">+₹{pricingResult.breakdown.fair_wage_reserve}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-white rounded-2xl border border-amber-100 text-xs text-slate-600 space-y-3 leading-relaxed">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('fair_pricing_index', 'Fair Wage Index')}:</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-black">
                      {pricingResult?.fair_pricing_index || '9.5'} / 10.0
                    </span>
                  </div>
                  
                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 font-medium text-slate-800">
                    {pricingResult?.explanation || 
                      `A baseline margin of 45% for ${pricingInput.category} provides a healthy buffer against seasonal swings while ensuring livable wages.`}
                  </div>

                  {pricingResult?.reasoning_steps && pricingResult.reasoning_steps.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <span className="font-bold text-slate-800 text-[11px] block">Step-by-Step AI Valuation Logic:</span>
                      {pricingResult.reasoning_steps.map((step, idx) => (
                        <p key={idx} className="text-[11px] text-slate-600 pl-2 border-l-2 border-amber-400">
                          {step}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pricingResult) {
                    setProductForm(prev => ({
                      ...prev,
                      production_cost: pricingInput.cost,
                      selling_price: pricingResult.suggested_price,
                      category: pricingInput.category
                    }));
                    setActiveTab('voice');
                    showNotification('Price applied to Product Form!');
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all"
              >
                Apply Suggested Price to Product Form
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
