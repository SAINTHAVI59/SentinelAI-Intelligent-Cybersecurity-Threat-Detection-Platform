/**
 * SentinelAI - Interactive Security Glossary Knowledge Base View
 * 
 * Plain-English definitions, practical attack examples, and direct
 * architectural relationships to SentinelAI components.
 */

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Tag, 
  ExternalLink, 
  HelpCircle, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { GlossaryTerm } from '../types';

export const GlossaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const CATEGORIES = ['ALL', 'Fundamentals', 'Threats & Attacks', 'Operations', 'Architecture'];

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTerm = item.term.toLowerCase().includes(query);
        const matchAcronym = item.acronym?.toLowerCase().includes(query);
        const matchPlain = item.plainEnglish.toLowerCase().includes(query);
        const matchTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchTerm && !matchAcronym && !matchPlain && !matchTags) return false;
      }
      return true;
    });
  }, [searchTerm, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedTermId(prev => (prev === id ? null : id));
  };

  // Quick jump helper
  const handleQuickJump = (termName: string) => {
    setSearchTerm(termName);
    setSelectedCategory('ALL');
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              Interactive Cybersecurity Glossary
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear, accessible terminology for students, engineers, and SOC practitioners.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span className="font-bold text-cyan-400">{GLOSSARY_TERMS.length}</span> Core Concepts Documented
        </div>
      </div>

      {/* Quick Jump Buttons for Key Terms */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          Featured Core Terms:
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            'Anomaly Detection',
            'False Positive',
            'Port Scanning',
            'SIEM',
            'Source IP',
            'Severity',
            'Brute Force',
            'MITRE ATT&CK'
          ].map(term => (
            <button
              key={term}
              onClick={() => handleQuickJump(term)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950/80 hover:border-cyan-700 hover:text-cyan-300 border border-slate-700/60 text-xs text-slate-300 transition font-mono"
            >
              {term}
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[11px] text-rose-400 hover:underline ml-2"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search cybersecurity terms, acronyms, or keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                selectedCategory === cat 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.length === 0 ? (
          <div className="col-span-2 p-10 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
            No terms match "{searchTerm}". Try a different keyword or category.
          </div>
        ) : (
          filteredTerms.map(item => {
            const isExpanded = expandedTermId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white tracking-tight">{item.term}</h2>
                        {item.acronym && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                            {item.acronym}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.category}</span>
                    </div>

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-white transition"
                      aria-label="Toggle technical details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Plain English Explanation */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-cyan-300 block mb-0.5">Plain-English:</span>
                    {item.plainEnglish}
                  </div>

                  {/* Real-World Example */}
                  <div className="mt-3 text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300 font-medium">Real-World Scenario:</strong> {item.example}
                  </div>

                  {/* Expandable Technical Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs animate-in fade-in duration-200">
                      <div>
                        <span className="font-semibold text-violet-300 block mb-0.5">Technical Mechanics:</span>
                        <p className="text-slate-300 leading-relaxed font-sans">{item.technicalDetails}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/60 mt-2">
                        <span className="font-semibold text-indigo-300 block mb-0.5 font-mono text-[11px]">
                          How It Relates to SentinelAI:
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{item.sentinelAiRelation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Tags and Expand Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-cyan-400 hover:underline font-mono text-[11px]"
                  >
                    {isExpanded ? 'Less details' : 'Technical deep dive &rarr;'}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
