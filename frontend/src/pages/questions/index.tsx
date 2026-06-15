import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/cards';
import { Button } from '../../components/ui/buttons/Button';
import { useTranslationContext } from '../../contexts/TranslationContext';

export const QuestionsPage: React.FC = () => {
  const { t } = useTranslationContext();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('questions.title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('questions.subtitle')}</p>
        </div>
        <Button 
          variant="gradient"
          gradient="from-blue-500 to-cyan-500"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Add Question
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Questions', value: '342', color: 'from-blue-500 to-cyan-500' },
          { label: 'Categories', value: '12', color: 'from-violet-500 to-purple-500' },
          { label: 'Active', value: '298', color: 'from-emerald-500 to-teal-500' },
          { label: 'Draft', value: '44', color: 'from-orange-500 to-amber-500' },
        ].map((stat) => (
          <div 
            key={stat.label}
            className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content */}
      <Card variant="elevated">
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-slate-100">
          <CardHeader
            title="Questions Library"
            subtitle="Browse and manage your question bank"
            className="py-5"
          />
        </div>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Questions Bank</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Questions will be displayed here with categories, difficulty levels, and detailed management options.
            </p>
            <Button 
              variant="gradient" 
              className="mt-6"
              gradient="from-blue-500 to-cyan-500"
            >
              Add First Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionsPage;