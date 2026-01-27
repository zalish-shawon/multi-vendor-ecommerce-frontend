/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reply Modal State
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/vendor/all');
      setReviews(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.vendor_reply || ''); // Pre-fill if editing
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyText) return toast.error("Write a reply first");
    setSending(true);
    try {
      await api.put(`/reviews/vendor/${selectedReview._id}/reply`, { reply: replyText });
      
      toast.success("Reply posted!");
      setReplyOpen(false);
      fetchReviews(); // Refresh list to update UI
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" /> 
          Customer Reviews
        </h1>
        <Badge variant="outline" className="px-3 py-1">
          Total Reviews: {reviews.length}
        </Badge>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                   No reviews received yet.
                 </TableCell>
               </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id} className="hover:bg-slate-50 transition-colors">
                  {/* Product Info */}
                  <TableCell className="max-w-[180px]">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded border bg-slate-100 flex-shrink-0 overflow-hidden">
                         {review.product_id?.images?.[0] && (
                            <img src={review.product_id.images[0]} className="h-full w-full object-cover" />
                         )}
                       </div>
                       <span className="truncate text-sm font-medium text-slate-700" title={review.product_id?.name}>
                         {review.product_id?.name}
                       </span>
                    </div>
                  </TableCell>
                  
                  {/* Customer Info */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={review.user_id?.profileImg} />
                         <AvatarFallback>{review.user_id?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{review.user_id?.name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Rating */}
                  <TableCell>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </TableCell>

                  {/* Comment & Reply Preview */}
                  <TableCell className="max-w-[300px]">
                     <div className="space-y-2">
                       <p className="text-sm text-slate-600 line-clamp-2 italic">&quot;{review.comment}&quot;</p>
                       {review.vendor_reply && (
                         <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 truncate">
                            <span className="font-bold">You:</span> {review.vendor_reply}
                         </div>
                       )}
                     </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                     {review.vendor_reply ? (
                       <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Replied
                       </Badge>
                     ) : (
                       <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          Pending
                       </Badge>
                     )}
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="text-right">
                     <Button 
                       variant={review.vendor_reply ? "outline" : "default"} 
                       size="sm" 
                       className={review.vendor_reply ? "" : "bg-blue-600 hover:bg-blue-700"}
                       onClick={() => openReplyModal(review)}
                     >
                        <MessageSquare className="h-4 w-4 mr-1" /> 
                        {review.vendor_reply ? "Edit Reply" : "Reply"}
                     </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- REPLY DIALOG --- */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
              <DialogTitle>Reply to {selectedReview?.user_id?.name}</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-4 py-2">
              <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-600 italic">
                 &quot;{selectedReview?.comment}&quot;
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Your Response</label>
                <Textarea 
                  placeholder="Thank you for your feedback..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
           </div>

           <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setReplyOpen(false)}>Cancel</Button>
              <Button onClick={handleSendReply} disabled={sending} className="bg-blue-600">
                 {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Reply"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}