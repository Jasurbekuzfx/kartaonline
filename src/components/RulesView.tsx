import React from 'react';
import { ChevronLeft, BookOpen, Award, Sparkles, AlertTriangle } from 'lucide-react';

interface RulesViewProps {
  onBack: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full w-full px-4 pt-3 pb-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800/60 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-white tracking-wide">
          O‘yin qoidalari
        </h1>
        <div className="w-10" />
      </div>

      {/* Scrollable Rules Content */}
      <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs leading-relaxed text-slate-200">
        {/* Umumiy qoidalar */}
        <section className="p-3.5 rounded-2xl btn-navy-panel space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <BookOpen className="w-4 h-4" />
            <h2>Asosiy qoidalar va koloda</h2>
          </div>
          <p>
            • O‘yinda <strong>32 talik koloda</strong> ishlatiladi: har bir mastda <strong>7, 8, 9, 10, Valet, Dama, Qirol va Tuz</strong> bo‘ladi (6 liklar qo‘shilmaydi, jami <strong>120 ochko</strong>).
          </p>
          <p>
            • <strong>2, 3 yoki 4 kishi</strong> o‘ynashi mumkin. 4 kishilik rejimda <strong>juftlik bo‘lib (2x2)</strong> o‘ynash ham mavjud.
          </p>
          <p>
            • Raund boshida har bir o‘yinchiga <strong>4 tadan karta</strong> tarqatiladi (4 kishi o‘ynaganda kolodada <strong>16 ta karta</strong> qoladi). Keyingi ochilgan karta <strong>kozir (kozyr)</strong> mastini belgilaydi.
          </p>
          <p>
            • O‘yinchilar navbat bilan bitta karta yoki bir xil mastdagi bir nechta karta tashlay oladi. Keyingi o‘yinchi tashlangan kartalarni kattaroq karta yoki kozir bilan urishi, yoki mos miqdorda karta tashlashi kerak.
          </p>
          <p>
            • Yurish yutib olingach, kolodada karta bor bo‘lsa, o‘yinchilar qo‘lini navbat tartibida 4 tagacha to‘ldiradi. Koloda tugagach, o‘yinchilar qo‘lidagi kartalarni o‘ynab tugatadi.
          </p>
        </section>

        {/* Karta ochkolari */}
        <section className="p-3.5 rounded-2xl btn-navy-panel space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <Award className="w-4 h-4" />
            <h2>Karta ochkolari va kuch tartibi</h2>
          </div>
          <p className="text-slate-300">
            Burkozelda <strong>O‘nlik (10)</strong> Qirol, Dama va Valetdan katta hisoblanadi:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 tabular-nums">
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">Tuz (A)</div>
              <div className="text-amber-400 font-bold">11 ochko</div>
            </div>
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">O‘nlik (10)</div>
              <div className="text-amber-400 font-bold">10 ochko</div>
            </div>
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">Qirol (K)</div>
              <div className="text-amber-400 font-bold">4 ochko</div>
            </div>
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">Dama (Q)</div>
              <div className="text-amber-400 font-bold">3 ochko</div>
            </div>
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">Valet (J)</div>
              <div className="text-amber-400 font-bold">2 ochko</div>
            </div>
            <div className="p-2 rounded-xl bg-[#071120] border border-slate-800 text-center">
              <div className="font-extrabold text-white">9, 8, 7</div>
              <div className="text-slate-400 font-bold">0 ochko</div>
            </div>
          </div>
        </section>

        {/* Maxsus kombinatsiyalar */}
        <section className="p-3.5 rounded-2xl btn-navy-panel space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <h2>Maxsus kombinatsiyalar</h2>
          </div>
          <p>
            • <strong>“Bura”</strong> — Qo‘lda 4 ta kozir karta yig‘ilishi.
          </p>
          <p>
            • <strong>“Molodka”</strong> — Bir xil mastdagi 4 ta karta yig‘ilishi.
          </p>
          <p>
            • <strong>“Moskva”</strong> — Qo‘lda 3 ta Tuz bo‘lib, ulardan biri kozir Tuz bo‘lishi.
          </p>
          <p>
            • <strong>“To‘rtta oxir”</strong> — Qo‘lda 4 ta 10 yoki 4 ta Tuz yig‘ilishi.
          </p>
        </section>

        {/* Jarima ochkolari */}
        <section className="p-3.5 rounded-2xl btn-navy-panel space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <h2>Raund yakuni va jarima ochkolari</h2>
          </div>
          <p>• <strong>61 yoki undan ko‘p ochko</strong> — 0 jarima ochkosi (G‘olib).</p>
          <p>• <strong>31–60 ochko</strong> — 2 jarima ochkosi.</p>
          <p>• <strong>0–30 ochko</strong> (kamida 1 ta yurish yutgan) — 4 jarima ochkosi.</p>
          <p>• <strong>Birorta ham yurish yutmagan</strong> — 6 jarima ochkosi.</p>
          <p className="text-amber-300 font-semibold pt-1">
            Jami 12 jarima ochkosiga yetgan o‘yinchi mag‘lub bo‘ladi.
          </p>
        </section>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full h-12 rounded-xl btn-gold-glossy font-extrabold text-sm cursor-pointer"
      >
        Tushunarli, orqaga qaytish
      </button>
    </div>
  );
};
