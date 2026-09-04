import { useState, useEffect } from 'react';
import { X, BookOpen, Quote, Sparkles } from 'lucide-react';

interface Reminder {
  type: 'Quran' | 'Hadith';
  arabic?: string;
  english: string;
  source: string;
  heading: string;
}

const REMINDERS: Reminder[] = [
  // Hadiths
  {
    type: 'Hadith',
    heading: 'Allah is pleased when you return to Him',
    english: '“Allah is more pleased with the repentance of His servant than one of you who finds his lost camel in a desert.”',
    source: 'Sahih Muslim 2747',
  },
  {
    type: 'Hadith',
    heading: 'Hardship can be a source of good',
    english: '“How wonderful is the affair of the believer! There is good for him in every matter, and this is for no one except a believer: if something good happens to him he is grateful, and that is good for him, and if something bad happens to him he is patient, and that is good for him.”',
    source: 'Sahih Muslim 2999',
  },
  {
    type: 'Hadith',
    heading: 'Even your pain has meaning',
    english: '“No fatigue, nor disease, nor sorrow, nor harm, nor distress befalls a Muslim, even if it were the prick of a thorn, but that Allah expiates some of his sins for that.”',
    source: 'Sahih al-Bukhari 5641; Sahih Muslim 2573',
  },
  {
    type: 'Hadith',
    heading: "Allah's mercy is greater than we imagine",
    english: '“Allah divided mercy into one hundred parts. He kept ninety-nine parts with Him and sent down one part to the earth. From this single part, creation is merciful to one another, so that even an animal lifts its hoof from its young lest it should harm them.”',
    source: 'Sahih al-Bukhari 6000; Sahih Muslim 2752',
  },
  {
    type: 'Hadith',
    heading: 'Allah treats you according to your expectations',
    english: '“I am as My servant expects Me to be, and I am with him when he remembers Me.”',
    source: 'Sahih al-Bukhari 7405; Sahih Muslim 2675',
  },
  {
    type: 'Hadith',
    heading: 'Patience brings immense reward',
    english: '“No one is given a gift better and more comprehensive than patience.”',
    source: 'Sahih al-Bukhari 1469; Sahih Muslim 1053',
  },
  {
    type: 'Hadith',
    heading: 'Your situation can change',
    english: '“Know that victory comes with patience, relief comes with affliction, and hardship comes with ease.”',
    source: 'Jamiʿ at-Tirmidhi 2516',
  },
  {
    type: 'Hadith',
    heading: 'Allah does not waste your efforts',
    english: '“No Muslim is afflicted with a hardship, even if it is a thorn that pricks him, except that Allah expiates his sins because of it.”',
    source: 'Sahih al-Bukhari 5641–5642',
  },
  {
    type: 'Hadith',
    heading: 'Keep asking Allah',
    english: '“Supplication is worship.”',
    source: 'Jamiʿ at-Tirmidhi 2969',
  },
  {
    type: 'Hadith',
    heading: 'The reward for patience has no limit',
    english: '“When Allah loves a people, He tests them. Whoever is content has Allah\'s pleasure, and whoever is angry has Allah\'s anger.”',
    source: 'Jamiʿ at-Tirmidhi 2396',
  },

  // Quran Verses
  {
    type: 'Quran',
    heading: 'Surah Ash-Sharh 94:5–6',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: '“Indeed, with hardship comes ease. Indeed, with hardship comes ease.”',
    source: 'Qur’an 94:5–6',
  },
  {
    type: 'Quran',
    heading: 'Surah Al-Baqarah 2:286',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    english: '“Allah does not burden a soul beyond what it can bear.”',
    source: 'Qur’an 2:286',
  },
  {
    type: 'Quran',
    heading: 'Surah Az-Zumar 39:53',
    arabic: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    english: '“Do not despair of the mercy of Allah.”',
    source: 'Qur’an 39:53',
  },
  {
    type: 'Quran',
    heading: 'Surah Ad-Duha 93:3–5',
    arabic: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ • وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ • وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
    english: '“Your Lord has not forsaken you, nor is He displeased. And the Hereafter is better for you than the first. And your Lord is going to give you, and you will be satisfied.”',
    source: 'Qur’an 93:3–5',
  },
  {
    type: 'Quran',
    heading: 'Surah At-Tawbah 9:51',
    arabic: 'قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا',
    english: '“Say, ‘Never will anything befall us except what Allah has decreed for us.’”',
    source: 'Qur’an 9:51',
  },
  {
    type: 'Quran',
    heading: 'Surah Al-Baqarah 2:153',
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    english: '“Indeed, Allah is with the patient.”',
    source: 'Qur’an 2:153',
  },
  {
    type: 'Quran',
    heading: 'Surah At-Talaq 65:2–3',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا • وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    english: '“Whoever is mindful of Allah, He will make a way out for them and provide for them from where they do not expect.”',
    source: 'Qur’an 65:2–3',
  },
  {
    type: 'Quran',
    heading: 'Surah Al-Ankabut 29:69',
    arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
    english: '“Those who strive for Us—We will surely guide them to Our ways.”',
    source: 'Qur’an 29:69',
  },
  {
    type: 'Quran',
    heading: 'Surah Ar-Ra\'d 13:28',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    english: '“Surely, in the remembrance of Allah do hearts find comfort.”',
    source: 'Qur’an 13:28',
  },
  {
    type: 'Quran',
    heading: 'Surah Yusuf 12:87',
    arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ',
    english: '“And do not lose hope in the mercy and relief of Allah.”',
    source: 'Qur’an 12:87',
  },
];

export default function DailyReminderModal({ isAppReady }: { isAppReady: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reminder, setReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (isAppReady) {
      // Select random reminder
      const randomIndex = Math.floor(Math.random() * REMINDERS.length);
      setReminder(REMINDERS[randomIndex]);
      
      // Brief timeout after app transitions to look beautiful
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [isAppReady]);

  if (!isOpen || !reminder) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-white to-emerald-50/20 dark:from-[#051a12] dark:to-[#020e0a] border border-emerald-900/15 dark:border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(4,47,31,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Intricate Islamic Geometric Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 dark:bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Type Tag */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/30 shadow-xs">
            <BookOpen size={22} className="animate-pulse" />
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
            <Sparkles size={10} /> Daily Reflection
          </span>
        </div>

        {/* Heading */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-emerald-100 mb-4 px-2">
          {reminder.heading}
        </h3>

        {/* Arabic (If Quran Verse) */}
        {reminder.arabic && (
          <div className="my-5 p-4 bg-emerald-50/40 dark:bg-[#03140e] rounded-2xl border border-emerald-900/5 dark:border-emerald-500/10">
            <p className="font-arabic text-xl sm:text-2xl leading-loose text-emerald-800 dark:text-emerald-300 text-center select-all tracking-wide font-medium">
              {reminder.arabic}
            </p>
          </div>
        )}

        {/* Translation Block */}
        <div className="relative px-2 mb-6 sm:px-4">
          <Quote size={40} className="absolute -top-4 -left-1 text-emerald-100 dark:text-emerald-900/20 pointer-events-none transform -scale-x-100" />
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic relative z-10 font-medium px-4">
            {reminder.english}
          </p>
        </div>

        {/* Source Citation */}
        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider bg-emerald-100/35 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg inline-block border border-emerald-200/20 dark:border-emerald-800/20">
          — {reminder.source}
        </div>

        {/* Motivation note */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-6 max-w-sm mx-auto">
          "When life feels heavy, remember: your patience, your tears, your duʿā, and your struggle are all witnessed and valued."
        </p>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            Alhamdulillah
          </button>
        </div>

        {/* Close Button Top Right */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer active:scale-90"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
