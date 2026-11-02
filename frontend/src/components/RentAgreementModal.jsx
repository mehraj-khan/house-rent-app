/* eslint-disable */
import { useState } from 'react';
import { Printer, X, FileText } from 'lucide-react';

const RentAgreementModal = ({ house, onClose }) => {
  const [formData, setFormData] = useState({
    landlordName: house?.owner?.name || '',
    landlordFather: '',
    landlordCnic: '',
    tenantName: '',
    tenantFather: '',
    tenantCnic: '',
    securityDeposit: house?.rentPrice ? house.rentPrice * 2 : 50000,
    monthlyRent: house?.rentPrice || 35000,
    noticePeriod: '1 Month',
    agreementDate: new Date().toISOString().split('T')[0],
  });

  const [isPreview, setIsPreview] = useState(false);

  // براؤزر پرنٹ کمانڈ
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="modal-content" style={{ maxWidth: isPreview ? '880px' : '600px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* ہیڈر بار (صرف سکرین پر دکھے گا، پرنٹ میں نہیں) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }} className="no-print">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', margin: 0 }}>
            <FileText /> Legal Rent Agreement (معاہدہ کرایہ داری)
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 1. فارم بھرنے کی اسکرین */}
        {!isPreview ? (
          <div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>
              Enter CNIC and tenancy terms to generate official Stamp Paper agreement.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); setIsPreview(true); }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>First Party / Landlord (مالک مکان):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="text" placeholder="Landlord Name" required value={formData.landlordName}
                    onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <input type="text" placeholder="Father's Name (ولدیت)" required value={formData.landlordFather}
                    onChange={(e) => setFormData({ ...formData, landlordFather: e.target.value })}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <input type="text" placeholder="Landlord CNIC (e.g. 35201-1234567-1)" required value={formData.landlordCnic}
                  onChange={(e) => setFormData({ ...formData, landlordCnic: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>Second Party / Tenant (کرایہ دار):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="text" placeholder="Tenant Name" required value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                  <input type="text" placeholder="Father's Name (ولدیت)" required value={formData.tenantFather}
                    onChange={(e) => setFormData({ ...formData, tenantFather: e.target.value })}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </div>
                <input type="text" placeholder="Tenant CNIC (e.g. 35202-9876543-2)" required value={formData.tenantCnic}
                  onChange={(e) => setFormData({ ...formData, tenantCnic: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Monthly Rent (PKR):</label>
                  <input type="number" required value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Security Advance (سیکیورٹی):</label>
                  <input type="number" required value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', background: '#15803d' }}>
                  Generate Stamp Agreement Preview 📄
                </button>
                <button type="button" onClick={onClose} style={{ flex: 1, background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 2. سرکاری اسٹامپ پیپر (کشادہ خانوں اور انگوٹھے کے باکس کے ساتھ) */
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }} className="no-print">
              <button onClick={handlePrint} className="btn-primary" style={{ flex: 1, background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                <Printer size={18} /> Print or Save as PDF (پی ڈی ایف ڈاؤنلوڈ کریں)
              </button>
              <button onClick={() => setIsPreview(false)} className="btn-secondary" style={{ padding: '12px 20px' }}>
                Edit Details
              </button>
            </div>

            {/* 📜 اصل پرنٹ ایبل ایگریمنٹ */}
            <div id="printable-agreement" className="stamp-paper-container">
              
              <div className="stamp-header">
                <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', letterSpacing: '2px' }}>
STANDARD RESIDENTIAL TENANCY AGREEMENT • مسودہ معاہدہ کرایہ داری                </div>
                <h2 style={{ fontSize: '24px', color: '#15803d', margin: '4px 0 2px' }}>معاہدہ کرایہ داری (RENT AGREEMENT)</h2>
                <p style={{ fontSize: '12px', color: '#475569' }}>
                  Executed in accordance with Pakistan Tenancy Laws (Stamp Duty Rs. 1,000)
                </p>
              </div>

              <div style={{ lineHeight: '1.7', fontSize: '13px', textAlign: 'justify', marginBottom: '15px' }}>
                <p>
                  یہ معاہدہ کرایہ داری بمقام <b>{house.city}</b> بتاریخ <b>{new Date(formData.agreementDate).toLocaleDateString()}</b> کو فریقین کے مابین طے پایا:
                </p>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderLeft: '4px solid #15803d', margin: '12px 0' }}>
                  <p>
                    <b>1. فریق اول (مالک مکان / Landlord):</b> جناب <b>{formData.landlordName}</b> ولد <b>{formData.landlordFather}</b>، حامل شناختی کارڈ نمبر: <b>{formData.landlordCnic}</b>۔
                  </p>
                  <p style={{ marginTop: '4px' }}>
                    <b>2. فریق دوم (کرایہ دار / Tenant):</b> جناب <b>{formData.tenantName}</b> ولد <b>{formData.tenantFather}</b>، حامل شناختی کارڈ نمبر: <b>{formData.tenantCnic}</b>۔
                  </p>
                </div>

                <p>
                  فریق اول مکان واقع: <b>{house.address}، {house.city}</b> مندرجہ ذیل شرائط پر فریق دوم کو کرائے پر دینے کا پابند ہوا ہے:
                </p>

                <h4 style={{ margin: '12px 0 6px', textDecoration: 'underline' }}>شرائط و ضوابط (TERMS & CONDITIONS):</h4>
                <ol style={{ paddingLeft: '18px', fontSize: '12px' }}>
                  <li><b>ماہانہ کرایہ:</b> مکان کا ماہانہ کرایہ مبلغ <b>PKR {Number(formData.monthlyRent).toLocaleString()}</b> روپے طے پایا ہے، جو فریق دوم ہر ماہ کی 5 تاریخ تک ادا کرے گا۔</li>
                  <li><b>سیکیورٹی ایڈوانس:</b> فریق دوم نے فریق اول کو سیکیورٹی ڈپازٹ کے طور پر مبلغ <b>PKR {Number(formData.securityDeposit).toLocaleString()}</b> روپے ادا کیے ہیں، جو کہ مکان خالی کرنے پر قابلِ واپسی (Refundable) ہوں گے۔</li>
                  <li><b>مدتِ معاہدہ:</b> یہ معاہدہ <b>11 ماہ</b> کے لیے نافذ العمل رہے گا، اور باہمی رضامندی سے تجدید ہوگا۔</li>
                  <li><b>یوٹیلٹی بلز:</b> بجلی، گیس، اور پانی کے ماہانہ بلز فریق دوم اپنے خرچ پر ادا کرے گا۔</li>
                  <li><b>نوٹس پیریڈ:</b> مکان خالی کرنے یا کروانے کے لیے کم از کم <b>1 ماہ کا تحریری نوٹس</b> دینا لازمی ہوگا۔</li>
                  <li><b>سب لیٹنگ کی ممانعت:</b> فریق دوم یہ مکان کسی دوسرے فرد کو آگے کرائے پر دینے کا مجاز نہ ہوگا۔</li>
                </ol>
              </div>

              {/* ✍️ دستخط، تفصیلات اور انگوٹھے کے کشادہ خانے */}
              <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1.5px solid #000' }}>
                
                {/* 1. مالک اور کرایہ دار کے کشادہ خانے مع انگوٹھا باکس */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  
                  {/* فریق اول (مالک) */}
                  <div style={{ border: '1px solid #475569', padding: '12px', borderRadius: '4px' }}>
                    <h5 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>فریق اول (مالک مکان / Landlord)</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ flex: 1, fontSize: '12px', lineHeight: '2' }}>
                        دستخط: ___________________<br />
                        نام: {formData.landlordName}<br />
                        شناختی کارڈ: {formData.landlordCnic}
                      </div>
                      <div style={{ width: '70px', height: '80px', border: '1px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', color: '#64748b' }}>
                        نشان انگوٹھا<br />(Thumb)
                      </div>
                    </div>
                  </div>

                  {/* فریق دوم (کرایہ دار) */}
                  <div style={{ border: '1px solid #475569', padding: '12px', borderRadius: '4px' }}>
                    <h5 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>فریق دوم (کرایہ دار / Tenant)</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ flex: 1, fontSize: '12px', lineHeight: '2' }}>
                        دستخط: ___________________<br />
                        نام: {formData.tenantName}<br />
                        شناختی کارڈ: {formData.tenantCnic}
                      </div>
                      <div style={{ width: '70px', height: '80px', border: '1px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', color: '#64748b' }}>
                        نشان انگوٹھا<br />(Thumb)
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. گواہ نمبر 1 اور گواہ نمبر 2 کے کشادہ خانے */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* گواہ 1 */}
                  <div style={{ border: '1px dashed #475569', padding: '12px', borderRadius: '4px' }}>
                    <h5 style={{ marginBottom: '6px', color: '#15803d' }}>گواہ نمبر 1 (Witness 1 - مالک کی طرف سے)</h5>
                    <div style={{ fontSize: '12px', lineHeight: '2.2' }}>
                      نام: _______________________________<br />
                      شناختی کارڈ: _______________________<br />
                      فون نمبر: ___________________________<br />
                      دستخط: _____________________________
                    </div>
                  </div>

                  {/* گواہ 2 */}
                  <div style={{ border: '1px dashed #475569', padding: '12px', borderRadius: '4px' }}>
                    <h5 style={{ marginBottom: '6px', color: '#15803d' }}>گواہ نمبر 2 (Witness 2 - کرایہ دار کی طرف سے)</h5>
                    <div style={{ fontSize: '12px', lineHeight: '2.2' }}>
                      نام: _______________________________<br />
                      شناختی کارڈ: _______________________<br />
                      فون نمبر: ___________________________<br />
                      دستخط: _____________________________
                    </div>
                  </div>

                </div>

              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#94a3b8' }}>
                    HouseRent PK Standard Tenancy Agreement Template • Ready for Police Khidmat Markaz Submission            
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RentAgreementModal;