/**
 * Font Usage Examples
 * 
 * Janna Arabic Font is now configured and ready to use!
 * 
 * Font: Cairo (Google Fonts) - excellent alternative to Janna Linotype
 * 
 * ============================================
 * USAGE EXAMPLES:
 * ============================================
 * 
 * 1. Apply Arabic font to any element:
 *    <div className="font-janna">نص عربي</div>
 *    <div className="font-arabic">نص عربي</div>
 * 
 * 2. Switch to RTL for Arabic:
 *    <div dir="rtl" className="font-janna">نص عربي من اليمين لليسار</div>
 * 
 * 3. Bilingual text:
 *    <div className="bilingual-container">
 *      <span className="english-text">Hello</span>
 *      <span className="bilingual-text">مرحبا</span>
 *    </div>
 * 
 * 4. Use Arabic numerals:
 *    <div className="arabic-numerals">١٢٣٤٥</div>
 * 
 * 5. Language-aware styling:
 *    <div lang="ar" className="font-janna">نص عربي</div>
 *    <div lang="en">English text</div>
 * 
 * ============================================
 * RTL Support Utilities:
 * ============================================
 * - rtl:text-right     - Right-align text in RTL mode
 * - rtl:text-left      - Left-align text in RTL mode  
 * - rtl:flex-row-reverse - Reverse flex direction
 * - rtl:ml-auto        - RTL margin-left auto
 * - rtl:mr-auto        - RTL margin-right auto
 * - rtl:flip-rtl       - Flip icons for RTL
 * 
 * ============================================
 * Changing Language Direction:
 * ============================================
 * To switch the entire app to Arabic:
 * 
 * Option 1: Change html tag direction
 * <html lang="ar" dir="rtl">
 * 
 * Option 2: Use JavaScript
 * document.documentElement.dir = 'rtl';
 * document.documentElement.lang = 'ar';
 * 
 * Option 3: Use a language context/hook to manage direction
 */

export function FontExample() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Font Configuration Test</h2>
      
      {/* English text (default) */}
      <p className="text-lg">English: Hello World</p>
      
      {/* Arabic text with Janna font */}
      <p className="text-lg font-janna">العربية: مرحبا بالعالم</p>
      
      {/* RTL Arabic text */}
      <div dir="rtl" className="font-janna text-lg">
        نص عربي من اليمين لليسار
      </div>
      
      {/* Bilingual example */}
      <div className="bilingual-container">
        <span className="english-text">Welcome to </span>
        <span className="bilingual-text font-janna">نظام التقييم</span>
      </div>
    </div>
  );
}