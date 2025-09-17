import { Share, Platform, Alert } from 'react-native';
import { DivePost } from '@/types';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
}

class ShareService {
  // Share a dive post
  async shareDivePost(post: DivePost): Promise<boolean> {
    try {
      const message = this.formatPostShareMessage(post);
      const shareOptions: ShareOptions = {
        title: `Check out this dive at ${post.diveSpot.name}!`,
        message: message,
      };

      if (Platform.OS === 'web') {
        // Web sharing using Web Share API or fallback
        return await this.shareOnWeb(shareOptions);
      } else {
        // Native sharing
        const result = await Share.share({
          title: shareOptions.title,
          message: shareOptions.message,
        });

        return result.action === Share.sharedAction;
      }
    } catch (error) {
      console.error('Error sharing dive post:', error);
      Alert.alert('Share Error', 'Failed to share the dive post. Please try again.');
      return false;
    }
  }

  // Format the share message for a dive post
  private formatPostShareMessage(post: DivePost): string {
    const { diveSpot, diveDetails, user, caption } = post;
    
    let message = `🤿 Amazing dive at ${diveSpot.name}!\n\n`;
    
    if (caption) {
      message += `"${caption}"\n\n`;
    }
    
    message += `📍 Location: ${diveSpot.address}\n`;
    message += `📊 Max Depth: ${diveDetails.depth}m\n`;
    message += `⏱️ Duration: ${diveDetails.diveDuration} minutes\n`;
    message += `🌊 Visibility: ${diveDetails.visibilityQuality}\n`;
    
    if (diveDetails.seaLife && diveDetails.seaLife.length > 0) {
      message += `🐟 Marine Life: ${diveDetails.seaLife.slice(0, 3).join(', ')}`;
      if (diveDetails.seaLife.length > 3) {
        message += ` and ${diveDetails.seaLife.length - 3} more!`;
      }
      message += '\n';
    }
    
    message += `\n👤 Shared by ${user.displayName} (@${user.username})\n`;
    message += `\n#DiveSpot #Diving #${diveSpot.name.replace(/\s+/g, '')} #CapeTownDiving`;
    
    return message;
  }

  // Web sharing implementation
  private async shareOnWeb(options: ShareOptions): Promise<boolean> {
    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.message,
          url: options.url || window.location.href,
        });
        return true;
      } else {
        // Fallback: Copy to clipboard and show options
        return await this.shareWebFallback(options);
      }
    } catch (error) {
      console.error('Web share failed:', error);
      return await this.shareWebFallback(options);
    }
  }

  // Web fallback sharing (copy to clipboard + social media links)
  private async shareWebFallback(options: ShareOptions): Promise<boolean> {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(options.message);
      
      // Show share options
      const shareUrls = this.generateSocialShareUrls(options);
      
      // Create a simple share modal (you could make this prettier)
      const shareChoice = await new Promise<string>((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); display: flex; justify-content: center;
          align-items: center; z-index: 10000;
        `;
        
        modal.innerHTML = `
          <div style="background: white; padding: 20px; border-radius: 12px; max-width: 400px; text-align: center;">
            <h3>Share this dive!</h3>
            <p style="margin: 10px 0; color: #666; font-size: 14px;">Text copied to clipboard!</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
              <button onclick="window.open('${shareUrls.twitter}', '_blank'); document.body.removeChild(this.closest('div').parentElement); resolve('twitter');" 
                      style="padding: 10px 16px; background: #1DA1F2; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Twitter
              </button>
              <button onclick="window.open('${shareUrls.facebook}', '_blank'); document.body.removeChild(this.closest('div').parentElement); resolve('facebook');" 
                      style="padding: 10px 16px; background: #4267B2; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Facebook
              </button>
              <button onclick="window.open('${shareUrls.whatsapp}', '_blank'); document.body.removeChild(this.closest('div').parentElement); resolve('whatsapp');" 
                      style="padding: 10px 16px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer;">
                WhatsApp
              </button>
            </div>
            <button onclick="document.body.removeChild(this.parentElement); resolve('close');" 
                    style="padding: 8px 16px; background: #f1f1f1; color: #666; border: none; border-radius: 6px; cursor: pointer;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up the resolve function globally
        (window as any).resolve = resolve;
      });
      
      return shareChoice !== 'close';
    } catch (error) {
      console.error('Web fallback share failed:', error);
      Alert.alert('Share', 'Share text copied to clipboard!');
      return true;
    }
  }

  // Generate social media share URLs
  private generateSocialShareUrls(options: ShareOptions) {
    const encodedMessage = encodeURIComponent(options.message);
    const encodedTitle = encodeURIComponent(options.title || '');
    const encodedUrl = encodeURIComponent(options.url || window.location.href);
    
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedMessage}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedMessage}`,
    };
  }

  // Share dive spot information
  async shareDiveSpot(diveSpot: any): Promise<boolean> {
    try {
      const message = `🏝️ Check out this dive spot: ${diveSpot.name}!\n\n📍 ${diveSpot.address}\n🎯 Difficulty: ${diveSpot.difficulty}\n🌊 Max Depth: ${diveSpot.maxDepth}m\n👁️ Visibility: ${diveSpot.visibility}m\n\n${diveSpot.description}\n\n#DiveSpot #Diving #CapeTownDiving`;
      
      const shareOptions: ShareOptions = {
        title: `Dive Spot: ${diveSpot.name}`,
        message: message,
      };

      if (Platform.OS === 'web') {
        return await this.shareOnWeb(shareOptions);
      } else {
        const result = await Share.share({
          title: shareOptions.title,
          message: shareOptions.message,
        });
        return result.action === Share.sharedAction;
      }
    } catch (error) {
      console.error('Error sharing dive spot:', error);
      Alert.alert('Share Error', 'Failed to share the dive spot. Please try again.');
      return false;
    }
  }
}

export const shareService = new ShareService();


