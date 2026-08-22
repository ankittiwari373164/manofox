import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Newspaper, Sparkles, Plus, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EMPTY_FORM = { title: "", summary: "", content: "", image_url: "", category: "News", status: "published" };

export default function Blogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/blogs");
      setPosts(data);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const runAutomation = async () => {
    setFetching(true);
    try {
      const { data } = await api.post("/admin/blogs/fetch-news");
      if (data.errors?.length) {
        toast.error(`${data.message}. Errors: ${data.errors.slice(0, 2).join(" | ")}`);
      } else {
        toast.success(data.message || "News fetched");
      }
      fetchPosts();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setFetching(false);
    }
  };

  const toggleStatus = async (post) => {
    const status = post.status === "published" ? "draft" : "published";
    try {
      await api.put(`/admin/blogs/${post.id}`, { status });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status } : p)));
      toast.success(status === "published" ? "Post published" : "Post unpublished");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/blogs/${toDelete.id}`);
      setPosts((prev) => prev.filter((p) => p.id !== toDelete.id));
      toast.success("Post deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setToDelete(null);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/blogs", form);
      toast.success("Post created");
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="admin-blogs-page">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-obsidian">Blog</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Trending industry news is fetched automatically every day. You can also add your own posts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            data-testid="blog-new-post-button"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-obsidian transition-colors duration-200 hover:border-fox hover:text-fox"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
          <button
            onClick={runAutomation}
            disabled={fetching}
            data-testid="blog-fetch-news-button"
            className="inline-flex items-center gap-2 rounded-full bg-fox px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-fox/90 disabled:opacity-60"
          >
            <Sparkles className={`h-4 w-4 ${fetching ? "animate-pulse" : ""}`} />
            {fetching ? "Fetching…" : "Fetch Trending News"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={submitForm}
          data-testid="blog-create-form"
          className="mt-6 rounded-2xl border border-black/5 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-obsidian">New Post</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
              data-testid="blog-form-title"
            />
            <input
              placeholder="Category (e.g. SEO, Social Media)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
              data-testid="blog-form-category"
            />
            <input
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
              data-testid="blog-form-image"
            />
            <textarea
              placeholder="Summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={2}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
              data-testid="blog-form-summary"
            />
            <textarea
              placeholder="Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm"
              data-testid="blog-form-content"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            data-testid="blog-form-submit"
            className="mt-4 rounded-full bg-fox px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Publish Post"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {loading ? (
          <div className="grid h-48 place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-fox border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center" data-testid="blogs-empty-state">
            <Newspaper className="h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-semibold text-neutral-500">No posts yet</p>
            <p className="text-sm text-neutral-400">Click "Fetch Trending News" or add a post manually.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="blogs-table">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-widest text-neutral-400">
                  <th className="px-6 py-4 font-bold">Post</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Source</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {posts.map((post) => (
                  <tr key={post.id} className="transition-colors duration-150 hover:bg-fox-light/40" data-testid={`blog-row-${post.id}`}>
                    <td className="max-w-xs px-6 py-4">
                      <p className="truncate font-bold text-obsidian" title={post.title}>{post.title}</p>
                      {post.is_automated ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400">
                          <Sparkles className="h-3 w-3" /> Auto-fetched
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-700">{post.category}</td>
                    <td className="px-6 py-4">
                      {post.source_url ? (
                        <a
                          href={post.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-fox hover:underline"
                        >
                          {post.source_name || "Source"} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-neutral-400">Original</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-neutral-500">
                      {new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(post)}
                        data-testid={`blog-status-toggle-${post.id}`}
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition-colors duration-200 ${
                          post.status === "published" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setToDelete(post)}
                        data-testid={`blog-delete-${post.id}`}
                        className="inline-grid h-9 w-9 place-items-center rounded-full text-red-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent data-testid="delete-blog-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{toDelete?.title}</strong> from the site. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-blog-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600" data-testid="delete-blog-confirm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}