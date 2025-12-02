"use client";

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/adminService';
import adminApi from '@/lib/api/adminAxios';
import { showToast } from '@/lib/utils/toast';

import { Comment as ApiComment } from '@/lib/api/types';

export type CommentType = {
  id: number;
  text: string;
  user?: string;
  chapter?: number;
  chapter_id?: number;
  parent?: number;
  created_at?: string;
  replies?: string;
}

export interface CommentReport {
  comment: number;
  reason: string;
}

export function useCommentsCRUD() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const apiComments = await adminService.getComments();
      const formattedComments: CommentType[] = apiComments.map(comment => ({
        id: comment.id,
        text: comment.text,
        user: comment.user,
        chapter: comment.chapter?.id,
        chapter_id: comment.chapter?.id,
        parent: undefined, // API-da mavjud emas
        created_at: comment.created_at,
        replies: undefined // API-da mavjud emas
      }));
      setComments(formattedComments);
      return formattedComments;
    } catch (error) {
      // Silent fail
      showToast('Commentlarni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await adminApi.get('/comments/report/');
      setReports(response.data);
      return response.data;
    } catch (error) {
      // Silent fail
      showToast('Comment reportlarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  const deleteComment = async (id: number) => {
    setIsDeleting(true);
    try {
      await adminApi.delete(`/comments/${id}/`);
      setComments((prevComments: CommentType[]) => prevComments.filter((comment) => comment.id !== id));
      return true;
    } catch (error) {
      // Silent fail
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const resolveReport = async (reportId: number) => {
    try {
      await adminApi.patch(`/comments/report/${reportId}/`, { resolved: true });
      setReports((prevReports) => prevReports.filter((report) => report.comment !== reportId));
      return true;
    } catch (error) {
      // Silent fail
      throw error;
    }
  };

  useEffect(() => {
    fetchComments();
    fetchReports();
  }, []);

  return {
    data: comments,
    reports,
    isLoading,
    deleteComment,
    deleting: isDeleting,
    resolveReport,
    refresh: fetchComments,
  };
}
