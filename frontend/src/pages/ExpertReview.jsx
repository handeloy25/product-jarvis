import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Server, 
  Lightbulb, 
  ClipboardList, 
  Palette, 
  BarChart3,
  Users,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Send,
  FileText,
  Settings
} from 'lucide-react';

// Icon mapping for personas
const iconMap = {
  code: Code,
  server: Server,
  lightbulb: Lightbulb,
  'clipboard-list': ClipboardList,
  palette: Palette,
  'chart-bar': BarChart3
};

// Color mapping for persona cards
const colorMap = {
  blue: 'bg-blue-100 border-blue-300 text-blue-800',
  green: 'bg-green-100 border-green-300 text-green-800',
  purple: 'bg-purple-100 border-purple-300 text-purple-800',
  orange: 'bg-orange-100 border-orange-300 text-orange-800',
  pink: 'bg-pink-100 border-pink-300 text-pink-800',
  cyan: 'bg-cyan-100 border-cyan-300 text-cyan-800'
};

const selectedColorMap = {
  blue: 'bg-blue-500 border-blue-600 text-white',
  green: 'bg-green-500 border-green-600 text-white',
  purple: 'bg-purple-500 border-purple-600 text-white',
  orange: 'bg-orange-500 border-orange-600 text-white',
  pink: 'bg-pink-500 border-pink-600 text-white',
  cyan: 'bg-cyan-500 border-cyan-600 text-white'
};

const ExpertReview = () => {
  const [personas, setPersonas] = useState([]);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [scope, setScope] = useState('current_state');
  const [context, setContext] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeCheckpoint, setIncludeCheckpoint] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  // Fetch personas on mount
  useEffect(() => {
    fetchPersonas();
    fetchQuickPrompts();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas/');
      const data = await response.json();
      setPersonas(data.personas);
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    }
  };

  const fetchQuickPrompts = async () => {
    try {
      const response = await fetch('/api/personas/quick-prompts');
      const data = await response.json();
      setQuickPrompts(data.quick_prompts);
    } catch (error) {
      console.error('Failed to fetch quick prompts:', error);
    }
  };

  const togglePersona = (personaId) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const selectQuickPrompt = (quickPrompt) => {
    setSelectedPersonas(quickPrompt.persona_ids);
    setScope(quickPrompt.scope);
  };

  const generatePrompt = async () => {
    if (selectedPersonas.length === 0) {
      alert('Please select at least one expert');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/personas/build-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_ids: selectedPersonas,
          scope: scope,
          context: context,
          specific_questions: specificQuestions ? specificQuestions.split('\n').filter(q => q.trim()) : null,
          include_checkpoint: includeCheckpoint,
          include_documentation: includeDocs
        })
      });
      const data = await response.json();
      setGeneratedPrompt(data.system_prompt);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
    }
    setLoading(false);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  const runEvaluation = async () => {
    if (!generatedPrompt || !context) {
      alert('Please generate a prompt and provide context first');
      return;
    }

    setEvaluating(true);
    try {
      // This calls your existing Claude assistant endpoint
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: generatedPrompt,
          message: context,
          include_portfolio_context: includeCheckpoint
        })
      });
      const data = await response.json();
      setEvaluation(data.response);
    } catch (error) {
      console.error('Failed to run evaluation:', error);
      setEvaluation('Error running evaluation. Please try again.');
    }
    setEvaluating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Expert Review Board
          </h1>
          <p className="text-gray-600 mt-2">
            Get honest, expert-level assessments from world-class advisors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Expert Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Prompts */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Reviews</h2>
              <div className="space-y-2">
                {quickPrompts.map(qp => (
                  <button
                    key={qp.id}
                    onClick={() => selectQuickPrompt(qp)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{qp.name}</div>
                    <div className="text-sm text-gray-500">{qp.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Expert Selection */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Experts</h2>
              <div className="space-y-2">
                {personas.map(persona => {
                  const IconComponent = iconMap[persona.icon] || Code;
                  const isSelected = selectedPersonas.includes(persona.id);
                  const colorClass = isSelected 
                    ? selectedColorMap[persona.color] 
                    : colorMap[persona.color];
                  
                  return (
                    <button
                      key={persona.id}
                      onClick={() => togglePersona(persona.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${colorClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium">{persona.name}</div>
                          <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                            {persona.title}
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedPersonas.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="text-sm font-medium text-indigo-900">
                    {selectedPersonas.length === 1 
                      ? '1 expert selected' 
                      : selectedPersonas.length === 6 
                        ? 'Full Board Review'
                        : `${selectedPersonas.length} experts selected`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Configuration & Output */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scope Selection */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Review Scope</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { value: 'current_state', label: 'Current State' },
                  { value: 'proposed_changes', label: 'Proposed Changes' },
                  { value: 'documentation', label: 'Documentation' },
                  { value: 'full_codebase', label: 'Full Codebase' },
                  { value: 'specific_feature', label: 'Specific Feature' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setScope(option.value)}
                    className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                      scope === option.value
                        ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Input */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Context</h2>
              <p className="text-sm text-gray-600 mb-3">
                Paste your CHECKPOINT.md, proposed changes, code snippets, or any context the experts should review.
              </p>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste your context here...

Examples:
- Current CHECKPOINT.md content
- Proposed feature specifications
- Code architecture decisions
- Current issues and concerns"
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
              
              {/* Advanced Options */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-4 h-4" />
                Advanced Options
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showAdvanced && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeCheckpoint"
                      checked={includeCheckpoint}
                      onChange={(e) => setIncludeCheckpoint(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="includeCheckpoint" className="text-sm text-gray-700">
                      Include portfolio context (products, positions, departments)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeDocs"
                      checked={includeDocs}
                      onChange={(e) => setIncludeDocs(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="includeDocs" className="text-sm text-gray-700">
                      Include documentation context
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specific Questions (one per line)
                    </label>
                    <textarea
                      value={specificQuestions}
                      onChange={(e) => setSpecificQuestions(e.target.value)}
                      placeholder="Should we use a monorepo structure?
Is our data model flexible enough for services?
What's the biggest risk we're not tracking?"
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generatePrompt}
                disabled={selectedPersonas.length === 0 || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate Prompt'}
              </button>
              <button
                onClick={runEvaluation}
                disabled={!generatedPrompt || !context || evaluating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                {evaluating ? 'Evaluating...' : 'Run Evaluation'}
              </button>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Generated System Prompt</h2>
                  <button
                    onClick={copyPrompt}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm max-h-64 overflow-y-auto">
                  {generatedPrompt}
                </pre>
                <p className="mt-3 text-sm text-gray-500">
                  You can copy this prompt and use it with Claude directly, or click "Run Evaluation" to get immediate feedback.
                </p>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluation && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                  Expert Evaluation
                </h2>
                <div className="prose prose-sm max-w-none">
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                    {evaluation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertReview;
