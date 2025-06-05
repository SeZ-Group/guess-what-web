import React from 'react';

export default function About() {
  return (
    <div className="about-container" dir="rtl">
      <h1>درباره guess what</h1>
      <p>
      داستان بازی ما از یک اتفاق ساده شروع شد؛ اسفند ۱۴۰۳، درجریان اولین پروژه مشترکمون. هر صبح، پیش از شروع کار، با یک کلمه همدیگر را به چالش می‌کشیدیم؛ بازی ساده‌ای که کم‌کم به آیینی کوچک برای شروع روز تبدیل شد.
      </p>
      <p>
این عادت کوچک در تعطیلات عید نوروز جان تازه‌ای گرفت و به چیزی فراتر از یک بازی تبدیل شد. انگار "گَس وات" به کانالی برای بیان ناگفته‌ها و احساساتمان بدل شده بود؛ راهی صمیمانه و غیرمستقیم برای گفتگو.
</p>
<p>
حالا، تصمیم گرفته‌ایم این تجربه شخصی و دوست‌داشتنی را رشد دهیم و آن را با افراد بیشتری به اشتراک بگذاریم؛ تا شاید شما هم در پس کلمات، راهی برای ارتباطی متفاوت پیدا کنید.
</p>
<p>
 روز تولد این بازی، همزمان با جشن تولد یکی از ماست؛ یک همزمانی شیرین که به این ماجرا، طعمی شخصی‌تر بخشیده. :)
       </p>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap');
        .about-container {
          max-width: 420px;
          margin: 2.5rem auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 #1976d222;
          padding: 2.2em 1.5em 1.5em 1.5em;
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          color: #222;
        }
        .about-container h1 {
          color: #1976d2;
          font-size: 1.5em;
          margin-bottom: 1em;
          text-align: center;
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          font-weight: 700;
        }
        .about-container p, .about-container li {
          text-align: right;
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          font-size: 1.08em;
          line-height: 2.1;
        }
        .about-container ul {
          margin: 1.2em 0 1.2em 1.5em;
          padding: 0 1.2em;
          font-size: 1.08em;
        }
        .about-container li {
          margin-bottom: 0.7em;
        }
        .about-container a {
          color: #1976d2;
          text-decoration: underline;
        }
        @media (max-width: 480px) {
          .about-container {
            max-width: 98vw;
            padding: 1.2em 0.5em 1em 0.5em;
            border-radius: 10px;
          }
          .about-container h1 {
            font-size: 1.1em;
          }
        }
      `}</style>
    </div>
  );
} 