import { motion } from 'framer-motion';
import { 
  Heart, 
  Repeat2, 
  MessageCircle, 
  Quote, 
  Bookmark, 
  Eye,
  Hash,
  AtSign,
  Link as LinkIcon,
  Image,
  Video,
  CheckCircle,
  Clock,
  Reply,
  Repeat
} from 'lucide-react';
import { FetchedPost } from '../types';

interface PostDisplayProps {
  post: FetchedPost;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostDisplay({ post }: PostDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4 border-b border-x-gray-700">
        <div className="flex items-start gap-3">
          {post.author && (
            <>
              <img
                src={post.author.profileImageUrl}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white truncate">{post.author.name}</span>
                  {post.author.verified && (
                    <CheckCircle className="w-4 h-4 text-x-blue flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-x-gray-400">
                  <span>@{post.author.username}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-x-gray-500">
                  <span>{formatNumber(post.author.followersCount)} followers</span>
                  <span>{formatNumber(post.author.tweetCount)} posts</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Post Type Badges */}
        {(post.isReply || post.isRetweet || post.isQuote) && (
          <div className="flex gap-2 mt-3">
            {post.isReply && (
              <span className="px-2 py-1 bg-x-gray-700 rounded-full text-xs text-x-gray-300 flex items-center gap-1">
                <Reply className="w-3 h-3" /> Reply
              </span>
            )}
            {post.isRetweet && (
              <span className="px-2 py-1 bg-x-gray-700 rounded-full text-xs text-x-gray-300 flex items-center gap-1">
                <Repeat className="w-3 h-3" /> Retweet
              </span>
            )}
            {post.isQuote && (
              <span className="px-2 py-1 bg-x-gray-700 rounded-full text-xs text-x-gray-300 flex items-center gap-1">
                <Quote className="w-3 h-3" /> Quote
              </span>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4">
        <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{post.text}</p>

        {/* Media indicator */}
        {post.hasMedia && (
          <div className="mt-3 flex gap-2">
            {post.mediaTypes.map((type, i) => (
              <span key={i} className="px-2 py-1 bg-x-blue/20 text-x-blue rounded-full text-xs flex items-center gap-1">
                {type === 'video' || type === 'animated_gif' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Entities */}
        {(post.entities.hashtags.length > 0 || post.entities.mentions.length > 0 || post.entities.urls.length > 0) && (
          <div className="mt-4 space-y-2">
            {post.entities.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.entities.hashtags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-x-purple/20 text-x-purple rounded-full text-xs flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {post.entities.mentions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.entities.mentions.map((mention) => (
                  <span key={mention} className="px-2 py-1 bg-x-green/20 text-x-green rounded-full text-xs flex items-center gap-1">
                    <AtSign className="w-3 h-3" />
                    {mention}
                  </span>
                ))}
              </div>
            )}
            {post.entities.urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.entities.urls.map((url, i) => (
                  <a 
                    key={i} 
                    href={url.expanded} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-x-gray-700 text-x-gray-300 rounded-full text-xs flex items-center gap-1 hover:bg-x-gray-600 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {url.display}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Engagement Metrics */}
      {post.metrics && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <MetricBox icon={Heart} label="Likes" value={post.metrics.likeCount} color="text-pink-500" />
            <MetricBox icon={Repeat2} label="Reposts" value={post.metrics.retweetCount} color="text-green-500" />
            <MetricBox icon={MessageCircle} label="Replies" value={post.metrics.replyCount} color="text-x-blue" />
            <MetricBox icon={Quote} label="Quotes" value={post.metrics.quoteCount} color="text-purple-500" />
            <MetricBox icon={Bookmark} label="Saves" value={post.metrics.bookmarkCount} color="text-yellow-500" />
            <MetricBox icon={Eye} label="Views" value={post.metrics.impressionCount} color="text-x-gray-400" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricBox({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="bg-x-gray-800/50 rounded-xl p-3 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <div className="text-lg font-bold text-white">{formatNumber(value)}</div>
      <div className="text-xs text-x-gray-500">{label}</div>
    </div>
  );
}
