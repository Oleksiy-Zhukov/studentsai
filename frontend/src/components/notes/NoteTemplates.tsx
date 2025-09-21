'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  BookOpen, 
  Lightbulb, 
  Calendar, 
  Target, 
  Users, 
  Zap,
  Plus,
  X,
  Check
} from 'lucide-react'

interface NoteTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  content: string
  tags: string[]
}

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void
  onClose: () => void
}

const templates: NoteTemplate[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structure for capturing meeting discussions and action items',
    icon: <Users className="h-5 w-5" />,
    content: `# Meeting Notes

**Date:** [Date]
**Attendees:** [List attendees]
**Agenda:** [Meeting agenda]

## Discussion Points
- [Key point 1]
- [Key point 2]
- [Key point 3]

## Action Items
- [ ] [Action item 1] - [Assignee] - [Due date]
- [ ] [Action item 2] - [Assignee] - [Due date]

## Next Steps
- [Next step 1]
- [Next step 2]

## Notes
[Additional notes and observations]`,
    tags: ['meeting', 'work', 'collaboration']
  },
  {
    id: 'lecture-notes',
    name: 'Lecture Notes',
    description: 'Template for academic lecture notes with key concepts',
    icon: <BookOpen className="h-5 w-5" />,
    content: `# [Subject] - [Topic]

**Date:** [Date]
**Instructor:** [Instructor name]
**Course:** [Course name]

## Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Key Concepts
### [Concept 1]
- Definition: [Definition]
- Example: [Example]
- Application: [How it's used]

### [Concept 2]
- Definition: [Definition]
- Example: [Example]
- Application: [How it's used]

## Important Formulas/Equations
- [Formula 1]: [Explanation]
- [Formula 2]: [Explanation]

## Questions & Clarifications
- [Question 1]
- [Question 2]

## Summary
[Key takeaways from the lecture]`,
    tags: ['academic', 'lecture', 'education']
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Comprehensive project planning and tracking template',
    icon: <Target className="h-5 w-5" />,
    content: `# [Project Name] - Project Plan

**Project Manager:** [Name]
**Start Date:** [Date]
**Target Completion:** [Date]
**Status:** [Planning/In Progress/On Hold/Completed]

## Project Overview
**Objective:** [Project objective]
**Scope:** [What's included and excluded]
**Success Criteria:** [How success is measured]

## Team & Roles
- [Role 1]: [Name] - [Responsibilities]
- [Role 2]: [Name] - [Responsibilities]

## Timeline & Milestones
- [ ] [Milestone 1] - [Due date]
- [ ] [Milestone 2] - [Due date]
- [ ] [Milestone 3] - [Due date]

## Tasks & Deliverables
### Phase 1: [Phase name]
- [ ] [Task 1] - [Assignee] - [Due date]
- [ ] [Task 2] - [Assignee] - [Due date]

### Phase 2: [Phase name]
- [ ] [Task 1] - [Assignee] - [Due date]
- [ ] [Task 2] - [Assignee] - [Due date]

## Resources & Budget
- **Budget:** [Amount]
- **Resources needed:** [List resources]
- **Tools & Software:** [List tools]

## Risks & Mitigation
- **Risk 1:** [Description] - [Mitigation strategy]
- **Risk 2:** [Description] - [Mitigation strategy]

## Notes
[Additional project notes]`,
    tags: ['project', 'planning', 'management']
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Personal daily reflection and planning template',
    icon: <Calendar className="h-5 w-5" />,
    content: `# [Date] - Daily Journal

## Today's Goals
- [ ] [Goal 1]
- [ ] [Goal 2]
- [ ] [Goal 3]

## What I Accomplished
- [Accomplishment 1]
- [Accomplishment 2]
- [Accomplishment 3]

## Challenges & Learnings
**Challenge:** [What was difficult]
**Learning:** [What I learned from it]

## Gratitude
- [Thing I'm grateful for 1]
- [Thing I'm grateful for 2]
- [Thing I'm grateful for 3]

## Tomorrow's Focus
- [Priority 1]
- [Priority 2]
- [Priority 3]

## Reflection
[How I'm feeling and what I want to improve]`,
    tags: ['personal', 'journal', 'reflection']
  },
  {
    id: 'idea-capture',
    name: 'Idea Capture',
    description: 'Quick template for capturing and developing ideas',
    icon: <Lightbulb className="h-5 w-5" />,
    content: `# [Idea Title]

**Date:** [Date]
**Status:** [New/In Development/Testing/Implemented/Abandoned]

## The Idea
[Describe the core idea in 1-2 sentences]

## Problem It Solves
[What problem does this idea address?]

## Target Audience
[Who would benefit from this idea?]

## Implementation Approach
[How could this be implemented?]

## Resources Needed
- [Resource 1]
- [Resource 2]
- [Resource 3]

## Potential Challenges
- [Challenge 1]
- [Challenge 2]

## Next Steps
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

## Related Ideas
- [Related idea 1]
- [Related idea 2]

## Notes
[Additional thoughts and considerations]`,
    tags: ['ideas', 'innovation', 'brainstorming']
  },
  {
    id: 'study-session',
    name: 'Study Session',
    description: 'Template for structured study sessions and review',
    icon: <Zap className="h-5 w-5" />,
    content: `# Study Session - [Subject/Topic]

**Date:** [Date]
**Duration:** [Time spent]
**Materials:** [Textbooks, notes, resources used]

## Study Goals
- [Goal 1]
- [Goal 2]
- [Goal 3]

## Topics Covered
### [Topic 1]
- Key points: [Main points]
- Understanding level: [1-5 scale]
- Questions: [Questions I have]

### [Topic 2]
- Key points: [Main points]
- Understanding level: [1-5 scale]
- Questions: [Questions I have]

## Practice Problems
- [Problem 1]: [Solution approach]
- [Problem 2]: [Solution approach]

## Difficult Concepts
- [Concept 1]: [Why it's difficult] - [How to improve understanding]
- [Concept 2]: [Why it's difficult] - [How to improve understanding]

## Review Questions
- [Question 1]
- [Question 2]
- [Question 3]

## Next Study Session
- [What to focus on next]
- [Materials to review]
- [Practice problems to work on]

## Confidence Level
**Overall:** [1-5 scale]
**Areas needing work:** [List areas]`,
    tags: ['study', 'academic', 'learning']
  }
]

export function NoteTemplates({ onSelectTemplate, onClose }: NoteTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags
  const allTags = Array.from(new Set(templates.flatMap(t => t.tags))).sort()

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || template.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleSelectTemplate = (template: NoteTemplate) => {
    setSelectedTemplate(template.id)
    setTimeout(() => {
      onSelectTemplate(template)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#141820] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#232a36]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Note Templates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a template to get started quickly</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-[#232a36] space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-[#232a36] rounded-lg bg-gray-50 dark:bg-[#0f1115] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedTag
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id
                    ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'hover:border-orange-300 dark:hover:border-orange-600'
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      Selected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No templates found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-[#232a36] bg-gray-50 dark:bg-[#0f1115]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const template = templates.find(t => t.id === selectedTemplate)
                  if (template) onSelectTemplate(template)
                }}
                disabled={!selectedTemplate}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
