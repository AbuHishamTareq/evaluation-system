<?php

namespace App\Services\Issues;

use App\Models\Issue;
use App\Models\IssueAttachment;
use App\Models\IssueComment;
use Illuminate\Pagination\LengthAwarePaginator;

class IssueService
{
    public function getAllIssues(array $filters = []): LengthAwarePaginator
    {
        $query = Issue::with(['reporter', 'assignee', 'department']);

        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['assignee_id'])) {
            $query->where('assignee_id', $filters['assignee_id']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(static function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function getIssueById(int $id): ?Issue
    {
        return Issue::with(['reporter', 'assignee', 'department', 'comments.user', 'attachments', 'linkedIncident', 'linkedEvaluation'])->find($id);
    }

    public function createIssue(array $data): Issue
    {
        return Issue::create($data);
    }

    public function updateIssue(Issue $issue, array $data): Issue
    {
        $issue->update($data);

        if (isset($data['status']) && $data['status'] === Issue::STATUS_RESOLVED && ! $issue->resolved_at) {
            $issue->resolve();
        }

        return $issue;
    }

    public function addComment(Issue $issue, int $userId, string $comment): IssueComment
    {
        $issueComment = IssueComment::create([
            'issue_id' => $issue->id,
            'user_id' => $userId,
            'comment' => $comment,
        ]);

        $mentions = $issueComment->getMentionedUsers();
        if (! empty($mentions)) {
            $this->processMentions($issueComment, $mentions);
        }

        return $issueComment->load('user');
    }

    public function addAttachment(Issue $issue, int $userId, array $fileData): IssueAttachment
    {
        $fileData['issue_id'] = $issue->id;
        $fileData['user_id'] = $userId;

        return IssueAttachment::create($fileData);
    }

    public function getDashboard(): array
    {
        return [
            'total' => Issue::count(),
            'open' => Issue::where('status', Issue::STATUS_OPEN)->count(),
            'in_progress' => Issue::where('status', Issue::STATUS_IN_PROGRESS)->count(),
            'resolved' => Issue::where('status', Issue::STATUS_RESOLVED)->count(),
            'urgent' => Issue::where('priority', Issue::PRIORITY_URGENT)->whereIn('status', [Issue::STATUS_OPEN, Issue::STATUS_IN_PROGRESS])->count(),
        ];
    }

    protected function processMentions(IssueComment $comment, array $mentions): void
    {
        // TODO: Implement notification sending for @mentions
        // This would create notification records for mentioned users
    }
}
