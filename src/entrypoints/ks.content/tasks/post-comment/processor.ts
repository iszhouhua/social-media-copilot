import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import { commentListQuery, VisionRootCommentItem, VisionSubCommentItem } from "../../api/comment-list-query";
import { visionSubCommentList } from "../../api/vision-sub-comment-list";

export class Processor extends TaskProcessor<FormSchema> {
    public mediaOptions = [];

    async execute() {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        for (const url of urls) {
            const comments = await this.getAwemeComments(url.id, limitPerId, completed);
            const count = this.getCommentCount(comments);
            total += count - limitPerId;
            completed += count;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
        }
        const count = this.getCommentCount(this.getCrawledComments());
        this.actions.setCompleted(count);
        this.actions.setTotal(count);
    }


    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '评论ID',
            '视频ID',
            '视频链接',

            '用户ID',
            '用户链接',
            '用户名称',

            '评论内容',
            '评论时间',
            '点赞数',
            '一级评论ID',
        ]];
        const getRow = (comment: VisionRootCommentItem | VisionSubCommentItem, root?: VisionRootCommentItem): Array<any> => {
            const row = [];
            row.push(comment.comment_id);
            row.push(comment.photoId);
            row.push(`https://www.kuaishou.com/short-video/${comment.photoId}`);

            row.push(comment.author_id);
            row.push(`https://www.kuaishou.com/profile/${comment.author_id}`);
            row.push(comment.author_name);

            row.push(comment.content);
            row.push(new Date(comment.timestamp));
            row.push(comment.likeCount);
            row.push(root?.comment_id || '-');
            return row;
        };
        const allComments = this.getCrawledComments();
        for (const comment of allComments) {
            dataList.push(getRow(comment));
            if (comment.subComments?.length) {
                for (const subComment of comment.subComments) {
                    dataList.push(getRow(subComment, comment));
                }
            }
        }
        return generateExcelDownloadOption(dataList, "快手-批量导出视频评论");
    }

    getMediaDownloadOptions() { return [] }

    /**
     * 获取视频的评论
     * @param task 连接信息
     * @param photoId 视频ID
     * @param limit 条数限制
     * @param completed 已抓取的数量
     */
    async getAwemeComments(
        photoId: string,
        limit: number,
        completed: number = 0,
    ): Promise<VisionRootCommentItem[]> {
        let cursor = "";
        const commentList: VisionRootCommentItem[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await this.next(
                {
                    key: `${photoId}:${cursor}`,
                    func: commentListQuery,
                    args: [photoId, cursor]
                });
            if (!commentPage?.visionCommentList?.rootCommentsV2?.length) break;
            // 增加评论数
            commentList.push(...(commentPage.visionCommentList.rootCommentsV2 || []));
            cursor = commentPage?.visionCommentList?.pcursor;
            // 更新进度
            const count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            if (count >= limit) {
                // 已经够了
                return commentList;
            }
            if (cursor === "no_more") {
                // 没有更多评论了
                break;
            }
        }
        // 一级评论不够，获取子评论
        const hasReplies = commentList.filter((item) => item.hasSubComments);
        for (const comment of hasReplies) {
            comment.subComments = [];
            let count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            comment.subComments = await this.getCommentReplies(
                photoId,
                comment.comment_id,
                limit - count,
            );
            // 更新进度
            count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            if (count >= limit) {
                // 已经够了
                return commentList;
            }
        }
        return commentList;
    }

    /**
     * 获取视频评论的子评论
     * @param client 连接信息
     * @param photoId 视频ID
     * @param commentId 根评论ID
     * @param limit 条数限制
     */
    async getCommentReplies(
        photoId: string,
        commentId: string,
        limit: number,
    ): Promise<VisionSubCommentItem[]> {
        let cursor = "";
        const commentReplies: VisionSubCommentItem[] = [];
        while (true) {
            const commentPage = await this.next({
                key: `${photoId}:${commentId}:${cursor}`,
                func: visionSubCommentList,
                args: [photoId, commentId, cursor]
            });
            if (!commentPage.visionSubCommentList?.subCommentsV2?.length) break;
            commentReplies.push(...(commentPage.visionSubCommentList?.subCommentsV2 || []));
            // 更新进度
            this.actions.setCompleted(prev => prev + commentPage.visionSubCommentList?.subCommentsV2?.length);
            if (commentReplies.length >= limit) {
                // 足够了
                break;
            }
            if (cursor === "no_more") {
                // 没有更多评论了
                break;
            }
            cursor = commentPage.visionSubCommentList.pcursor;
        }
        return commentReplies;
    }

    getCommentCount = (comments: VisionRootCommentItem[]): number => {
        return comments
            .map((o) => o.subComments?.length ?? 0)
            .reduce((a, b) => a + b, comments.length);
    };

    getCrawledComments() {
        const allComments: VisionRootCommentItem[] = [];
        for (const url of this.condition.urls) {
            const keys = this.dataCache.keys().filter(key => key.startsWith(url.id));
            for (const key of keys) {
                const data = this.dataCache.get(key);
                if (!data) continue;
                const comments = data.visionCommentList.rootCommentsV2 || data.visionSubCommentList.subCommentsV2 || []
                if (!comments) continue;
                comments.forEach((o: any) => {
                    o.photoId = url.id
                })
                const nodes = key.split(':');
                if (nodes.length === 3) {
                    const comment = allComments.find(item => item.comment_id == nodes[1]);
                    if (!comment) continue;
                    if (!comment.subComments) comment.subComments = [];
                    comment.subComments.push(...comments as VisionSubCommentItem[]);
                    comment.subComments = unionBy(comment.subComments, 'comment_id');
                } else {
                    allComments.push(...comments as VisionRootCommentItem[]);
                }
            }
        }
        return unionBy(allComments, 'comment_id');
    }
}