/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Calculator, Printer, ArrowLeft, RotateCcw, 
  Share2, Users, Scale, AlertCircle, ShieldCheck, Snowflake 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BillCalculator = () => {
  const { lang } = useAuth();
  const navigate = useNavigate();

  // 🌟 مین موڈ: 'submeter' (سب میٹر کے ساتھ) یا 'nosubmeter' (بغیر سب میٹر)
  const [calcMode, setCalcMode] = useState('submeter');

  // بنیادی معلومات
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [billingMonth, setBillingMonth] = useState('Current Month');
  const [mainBillAmount, setMainBillAmount] = useState('');
  const [extraCharges, setExtraCharges] = useState(''); // پانی، موٹر، گیس

  // 1. سب میٹر اسٹیٹس
  const [mainUnits, setMainUnits] = useState('');
  const [prevReading, setPrevReading] = useState('');
  const [currReading, setCurrReading] = useState('');

  // 2. بغیر سب میٹر اسٹیٹس
  const [splitMethod, setSplitMethod] = useState('50-50'); // '50-50' | '40-60' | 'headcount' | 'custom'
  const [customPercent, setCustomPercent] = useState(50);
  const [landlordPeople, setLandlordPeople] = useState(4);
  const [tenantPeople, setTenantPeople] = useState(2);
  
  // اے سی چارجز (اگر اے سی چلا ہو)
  const [hasAc, setHasAc] = useState(false);
  const [acCharges, setAcCharges] = useState('');

  // فائنل رزلٹ
  const [result, setResult] = useState(null);

  // حساب کتاب کا ماسٹر فنکشن
  const handleCalculate = (e) => {
    e.preventDefault();
    const mainBill = Number(mainBillAmount);
    const extras = Number(extraCharges) || 0;
    const acCost = hasAc ? (Number(acCharges) || 0) : 0;

    if (mainBill <= 0) {
      alert(lang === 'en' ? 'Please enter valid main bill amount!' : 'براہ کرم مین بل کی درست رقم درج کریں!');
      return;
    }

    // ==========================================
    // موڈ 1: سب میٹر کے ساتھ حساب
    // ==========================================
    if (calcMode === 'submeter') {
      const totalUnits = Number(mainUnits);
      const pReading = Number(prevReading);
      const cReading = Number(currReading);

      if (cReading < pReading) {
        alert(lang === 'en' ? 'Current reading cannot be less than previous!' : 'موجودہ ریڈنگ پچھلی سے کم نہیں ہو سکتی!');
        return;
      }
      if (totalUnits <= 0) {
        alert(lang === 'en' ? 'Please enter total main bill units!' : 'مین بل کے کل یونٹس درج کریں!');
        return;
      }

      const unitsConsumed = cReading - pReading;
      const perUnitRate = mainBill / totalUnits;
      const electricityCost = Math.round(unitsConsumed * perUnitRate);
      const grandTotal = electricityCost + extras;

      setResult({
        mode: 'submeter',
        tenantName: tenantName || 'Tenant',
        tenantPhone,
        billingMonth,
        unitsConsumed,
        perUnitRate: perUnitRate.toFixed(2),
        electricityCost,
        extras,
        acCost: 0,
        grandTotal,
        date: new Date().toLocaleDateString(),
        explanation: `سب میٹر کے ${unitsConsumed} یونٹس کو سرکاری بل کے اوسط ریٹ (PKR ${perUnitRate.toFixed(2)} بشمول تمام ٹیکسز اور سلیبز) سے منصفانہ طور پر ضرب دی گئی ہے۔`
      });
    }

    // ==========================================
    // موڈ 2: بغیر سب میٹر کے حساب (لڑائی ختم)
    // ==========================================
    else {
      let electricityCost = 0;
      let explanation = '';

      // اگر اے سی چلا ہو تو پہلے اے سی کا خرچہ مائنس ہوگا
      const remainingBillAfterAc = Math.max(0, mainBill - acCost);

      if (splitMethod === '50-50') {
        electricityCost = Math.round(remainingBillAfterAc * 0.5);
        explanation = `بغیر سب میٹر: 50% نصف نصف (برابر پورشنز) کی بنیاد پر تقسیم۔`;
      } else if (splitMethod === '40-60') {
        electricityCost = Math.round(remainingBillAfterAc * 0.4);
        explanation = `بغیر سب میٹر: اوپر والے چھوٹے پورشن کے 40% رقبے کی بنیاد پر تقسیم۔`;
      } else if (splitMethod === 'custom') {
        electricityCost = Math.round(remainingBillAfterAc * (Number(customPercent) / 100));
        explanation = `بغیر سب میٹر: باہمی طے شدہ ${customPercent}% تناسب کی بنیاد پر تقسیم۔`;
      } else if (splitMethod === 'headcount') {
        const lPeople = Number(landlordPeople) || 1;
        const tPeople = Number(tenantPeople) || 1;
        const totalPeople = lPeople + tPeople;
        const costPerPerson = remainingBillAfterAc / totalPeople;
        electricityCost = Math.round(costPerPerson * tPeople);
        explanation = `بغیر سب میٹر: افراد کی تعداد (کل ${totalPeople} افراد میں سے کرایہ دار کے ${tPeople} افراد) کے حساب سے منصفانہ فی کس تقسیم۔`;
      }

      const grandTotal = electricityCost + acCost + extras;

      setResult({
        mode: 'nosubmeter',
        tenantName: tenantName || 'Tenant',
        tenantPhone,
        billingMonth,
        unitsConsumed: 'Shared (مشترکہ)',
        perUnitRate: 'N/A',
        electricityCost,
        extras,
        acCost,
        grandTotal,
        date: new Date().toLocaleDateString(),
        explanation
      });
    }
  };

  const resetForm = () => {
    setTenantName('');
    setTenantPhone('');
    setMainBillAmount('');
    setMainUnits('');
    setPrevReading('');
    setCurrReading('');
    setExtraCharges('');
    setHasAc(false);
    setAcCharges('');
    setResult(null);
  };

  // واٹس ایپ پر شفاف رسید بھیجنا
  const shareOnWhatsApp = () => {
    if (!result) return;
    const msg = `⚡ *UTILITY & ELECTRICITY BILL BREAKDOWN* ⚡\n` +
      `👤 Tenant: *${result.tenantName}*\n` +
      `📅 Billing Month: *${result.billingMonth}*\n` +
      `---------------------------------\n` +
      (result.mode === 'submeter'
        ? `🔢 Sub-Meter Units: *${result.unitsConsumed} Units*\n` +
          `💵 Unit Cost (Taxes Included): PKR ${result.perUnitRate}\n` +
          `⚡ Electricity Share: *PKR ${result.electricityCost.toLocaleString()}*\n`
        : `🤝 Billing Mode: *No Sub-Meter (مشترکہ تقسیم)*\n` +
          `⚡ Electricity Share: *PKR ${result.electricityCost.toLocaleString()}*\n` +
          (result.acCost > 0 ? `❄️ AC Surcharge: PKR ${result.acCost.toLocaleString()}\n` : '')
      ) +
      (result.extras > 0 ? `💧 Water/Motor/Misc: PKR ${result.extras.toLocaleString()}\n` : '') +
      `---------------------------------\n` +
      `💰 *TOTAL PAYABLE: PKR ${result.grandTotal.toLocaleString()}*\n` +
      `---------------------------------\n` +
      `📝 *Audit Note:* ${result.explanation}\n` +
      `_Generated fairly via HouseRent PK Anti-Dispute Engine_`;

    let cleanPhone = (tenantPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.substring(1);

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="container" style={{ maxWidth: '850px', marginTop: '30px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-outline no-print"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}
      >
        <ArrowLeft size={16} /> {lang === 'en' ? 'Back' : 'واپس جائیں'}
      </button>

      {/* ہیڈر کارڈ */}
      <div className="house-card no-print" style={{ padding: '25px', background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', color: 'white', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Zap size={28} color="#eab308" />
          {lang === 'en' ? 'WAPDA Bill & Sub-Meter Splitter ⚡' : 'بجلی کے بل کی غیر متنازعہ تقسیم (Anti-Dispute) ⚡'}
        </h2>
        <p style={{ opacity: 0.9, fontSize: '14px', marginTop: '6px' }}>
          {lang === 'en'
            ? 'Fairly calculate electricity bills with sub-meter or split shared bills peacefully without sub-meters.'
            : 'سب میٹر لگا ہو یا نہ لگا ہو، تمام سرکاری ٹیکسز کے مطابق بل کو بغیر لڑائی جھگڑے کے منصفانہ طور پر تقسیم کریں۔'}
        </p>

        {/* 🌟 2 بڑے موڈز کا انتخاب (سب میٹر کے ساتھ / بغیر سب میٹر کے) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <button
            type="button"
            onClick={() => { setCalcMode('submeter'); setResult(null); }}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              border: calcMode === 'submeter' ? '2.5px solid #eab308' : '1px solid rgba(255,255,255,0.2)',
              background: calcMode === 'submeter' ? '#ffffff' : 'rgba(255,255,255,0.1)',
              color: calcMode === 'submeter' ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Zap size={18} color={calcMode === 'submeter' ? '#eab308' : '#fff'} />
            {lang === 'en' ? 'Option 1: With Sub-Meter ⚡' : 'آپشن 1: سب میٹر لگا ہوا ہے ⚡'}
          </button>

          <button
            type="button"
            onClick={() => { setCalcMode('nosubmeter'); setResult(null); }}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              border: calcMode === 'nosubmeter' ? '2.5px solid #eab308' : '1px solid rgba(255,255,255,0.2)',
              background: calcMode === 'nosubmeter' ? '#ffffff' : 'rgba(255,255,255,0.1)',
              color: calcMode === 'nosubmeter' ? '#0f172a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Scale size={18} color={calcMode === 'nosubmeter' ? '#eab308' : '#fff'} />
            {lang === 'en' ? 'Option 2: No Sub-Meter (Shared) 🤝' : 'آپشن 2: کوئی سب میٹر نہیں ہے 🤝'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* فارم ان پٹ باکس */}
        <div className="house-card no-print" style={{ padding: '25px' }}>
          <h3 style={{ fontSize: '17px', marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="#2563eb" />
            {calcMode === 'submeter' ? 'Sub-Meter Readings & Bill' : 'Shared Bill Calculation (بغیر سب میٹر)'}
          </h3>

          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tenant Name (نام):</label>
                <input
                  type="text" placeholder="e.g. Ali Khan"
                  value={tenantName} onChange={(e) => setTenantName(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tenant WhatsApp (فون):</label>
                <input
                  type="text" placeholder="03001234567"
                  value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Billing Month:</label>
                <input
                  type="text" placeholder="e.g. November 2026"
                  value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Total Main Bill (PKR):</label>
                <input
                  type="number" required placeholder="کل سرکاری بل کی رقم"
                  value={mainBillAmount} onChange={(e) => setMainBillAmount(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* 🔴 موڈ 1 کے لیے: سب میٹر ان پٹس */}
            {calcMode === 'submeter' ? (
              <div style={{ background: '#fefce8', padding: '14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#854d0e', textTransform: 'uppercase' }}>Sub-Meter Units Calculation:</span>
                
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Main Meter Total Units (سرکاری بل کے کل یونٹ):</label>
                  <input
                    type="number" required placeholder="e.g. 520"
                    value={mainUnits} onChange={(e) => setMainUnits(e.target.value)}
                    style={{ width: '100%', padding: '8px', margin: '4px 0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Previous Reading (پچھلی):</label>
                    <input
                      type="number" required placeholder="e.g. 1420"
                      value={prevReading} onChange={(e) => setPrevReading(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Current Reading (موجودہ):</label>
                    <input
                      type="number" required placeholder="e.g. 1580"
                      value={currReading} onChange={(e) => setCurrReading(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* 🔴 موڈ 2 کے لیے: بغیر سب میٹر تقسیم کا آپشن */
              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', textTransform: 'uppercase' }}>Select Shared Splitting Method:</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0 12px' }}>
                  <button
                    type="button" onClick={() => setSplitMethod('50-50')}
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: splitMethod === '50-50' ? '2px solid #2563eb' : '1px solid #cbd5e1', background: splitMethod === '50-50' ? '#ffffff' : '#f8fafc', color: splitMethod === '50-50' ? '#2563eb' : '#475569' }}
                  >
                    ⚖️ 50% - 50% (نصف نصف)
                  </button>

                  <button
                    type="button" onClick={() => setSplitMethod('40-60')}
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: splitMethod === '40-60' ? '2px solid #2563eb' : '1px solid #cbd5e1', background: splitMethod === '40-60' ? '#ffffff' : '#f8fafc', color: splitMethod === '40-60' ? '#2563eb' : '#475569' }}
                  >
                    🏢 40% (اوپر پورشن)
                  </button>

                  <button
                    type="button" onClick={() => setSplitMethod('headcount')}
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: splitMethod === 'headcount' ? '2px solid #2563eb' : '1px solid #cbd5e1', background: splitMethod === 'headcount' ? '#ffffff' : '#f8fafc', color: splitMethod === 'headcount' ? '#2563eb' : '#475569' }}
                  >
                    👥 افراد کی تعداد
                  </button>

                  <button
                    type="button" onClick={() => setSplitMethod('custom')}
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: splitMethod === 'custom' ? '2px solid #2563eb' : '1px solid #cbd5e1', background: splitMethod === 'custom' ? '#ffffff' : '#f8fafc', color: splitMethod === 'custom' ? '#2563eb' : '#475569' }}
                  >
                    ✏️ کسٹم فیصد %
                  </button>
                </div>

                {/* افراد کی تعداد والا فیلڈ */}
                {splitMethod === 'headcount' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Landlord People (مالک فیملی):</label>
                      <input
                        type="number" min="1" value={landlordPeople} onChange={(e) => setLandlordPeople(e.target.value)}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Tenant People (کرایہ دار):</label>
                      <input
                        type="number" min="1" value={tenantPeople} onChange={(e) => setTenantPeople(e.target.value)}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                )}

                {/* کسٹم فیصد */}
                {splitMethod === 'custom' && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tenant Share (%):</label>
                    <input
                      type="number" min="1" max="99" value={customPercent} onChange={(e) => setCustomPercent(e.target.value)}
                      style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                )}

                {/* ❄️ اے سی کا تنازعہ ختم کرنے کا آپشن */}
                <div style={{ marginTop: '12px', borderTop: '1px dashed #bfdbfe', paddingTop: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hasAc} onChange={(e) => setHasAc(e.target.checked)} />
                    <Snowflake size={15} color="#2563eb" />
                    کرایہ دار نے اے سی (AC) چلایا تھا؟ (اضافی اے سی فیس)
                  </label>

                  {hasAc && (
                    <input
                      type="number" placeholder="Enter AC Surcharge Amount (e.g. 10000)"
                      value={acCharges} onChange={(e) => setAcCharges(e.target.value)}
                      style={{ width: '100%', padding: '8px', marginTop: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* پانی، موٹر یا گیس کے چارجز */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Water Motor / Gas / Maintenance Charges (PKR) (اختیاری):
              </label>
              <input
                type="number" placeholder="e.g. 1500 (Optional)"
                value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Zap size={18} /> Calculate Fair Bill (بل بنائیں)
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '12px 18px' }}>
                <RotateCcw size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
           دایاں حصہ: شفاف ڈیجیٹل رسید (Printable & WhatsApp)
           ======================================================== */}
        {result && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }} className="no-print">
              <button
                onClick={shareOnWhatsApp}
                style={{
                  flex: 1, padding: '11px', background: '#25d366', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Share2 size={16} /> Send via WhatsApp
              </button>

              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 18px' }}
              >
                <Printer size={16} /> Print
              </button>
            </div>

            {/* 🧾 اصل پرنٹ ایبل رسید */}
            <div id="printable-agreement" className="house-card" style={{ padding: '25px', border: '2px solid #2563eb', background: '#ffffff' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold', letterSpacing: '1px' }}>OFFICIAL UTILITY AUDIT</span>
                <h3 style={{ margin: '4px 0 2px', fontSize: '20px', color: '#0f172a' }}>Electricity & Shared Utility Invoice</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Date: {result.date} | Month: <b>{result.billingMonth}</b></p>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', marginBottom: '15px' }}>
                Tenant Name: <b>{result.tenantName}</b> {result.tenantPhone && `(${result.tenantPhone})`}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '15px 0', marginBottom: '15px' }}>
                
                {result.mode === 'submeter' ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Sub-Meter Units Consumed:</span>
                      <b>{result.unitsConsumed} Units</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px' }}>
                      <span>Effective Unit Rate (All Taxes):</span>
                      <span>PKR {result.perUnitRate} / unit</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Calculation Basis:</span>
                    <b>{result.unitsConsumed}</b>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base Electricity Share:</span>
                  <b>PKR {result.electricityCost.toLocaleString()}</b>
                </div>

                {result.acCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e40af' }}>
                    <span>AC Surcharge (اے سی خرچہ):</span>
                    <b>+ PKR {result.acCost.toLocaleString()}</b>
                  </div>
                )}

                {result.extras > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                    <span>Water / Motor / Misc:</span>
                    <span>PKR {result.extras.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* کل بل */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e3a8a' }}>TOTAL PAYABLE:</span>
                <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#2563eb' }}>
                  PKR {result.grandTotal.toLocaleString()}
                </span>
              </div>

              {/* 🛡️ انصاف اور شفافیت کا نوٹ (لڑائی ختم کرنے کے لیے) */}
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginTop: '15px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                <b>🛡️ شفافیت کی ضمانت (Audit Guarantee):</b><br />
                {result.explanation}
              </div>

              <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px', color: '#94a3b8' }}>
                Generated via HouseRent PK Anti-Dispute Utility Engine • 100% Transparent
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BillCalculator;