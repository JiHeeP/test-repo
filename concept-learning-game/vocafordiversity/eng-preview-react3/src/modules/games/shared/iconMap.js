/**
 * iconMap.js — vocabData.json의 icon 문자열 → lucide-react 컴포넌트 매핑
 */
import {
  FlaskConical, Activity, ArrowRightLeft, Atom, ListOrdered,
  MessageSquareText, Waves, Search, Trees, BookOpen, HelpCircle,
} from 'lucide-react';

const iconMap = {
  FlaskConical,
  Activity,
  ArrowRightLeft,
  Atom,
  ListOrdered,
  MessageSquareText,
  Waves,
  Search,
  Trees,
  BookOpen,
};

/** @param {string} name - lucide-react 아이콘 이름 */
export function getIcon(name) {
  return iconMap[name] || HelpCircle;
}
