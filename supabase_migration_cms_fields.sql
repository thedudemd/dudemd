-- Run this in Supabase SQL Editor

ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS facebook_teaser_text TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS teaser_hook TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS pillar_topic_id UUID REFERENCES articles(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_post_ids TEXT[]; -- Array of article IDs
ALTER TABLE articles ADD COLUMN IF NOT EXISTS next_recommended_id UUID REFERENCES articles(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cornerstone_article_id UUID REFERENCES articles(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS monetization_type TEXT CHECK (monetization_type IN ('affiliate', 'sponsored', 'lead_magnet', 'product_review', 'none'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cta_type TEXT CHECK (cta_type IN ('newsletter', 'download', 'product', 'course', 'consultation', 'affiliate', 'none'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS article_template TEXT CHECK (article_template IN ('pillar', 'supporting', 'news_brief', 'roundup', 'explainer', 'affiliate_review', 'standard'));
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_pillar_content BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_cornerstone BOOLEAN DEFAULT false;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_articles_pillar_topic ON articles(pillar_topic_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_pillar ON articles(is_pillar_content) WHERE is_pillar_content = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_cornerstone ON articles(is_cornerstone) WHERE is_cornerstone = true;

COMMENT ON COLUMN articles.social_title IS 'Custom title for social sharing (Twitter/Facebook). Falls back to meta_title if empty.';
COMMENT ON COLUMN articles.social_description IS 'Custom description for social sharing. Falls back to meta_description if empty.';
COMMENT ON COLUMN articles.facebook_teaser_text IS 'Short teaser text optimized for Facebook posts (2-3 sentences max).';
COMMENT ON COLUMN articles.teaser_hook IS 'Compelling hook/opening line to draw readers in from social or homepage.';
COMMENT ON COLUMN articles.pillar_topic_id IS 'Parent pillar article this supports. NULL if this IS a pillar.';
COMMENT ON COLUMN articles.related_post_ids IS 'Array of related article IDs for internal linking.';
COMMENT ON COLUMN articles.next_recommended_id IS 'Next article to recommend at end of this one.';
COMMENT ON COLUMN articles.cornerstone_article_id IS 'Evergreen cornerstone article to link to from this piece.';
COMMENT ON COLUMN articles.monetization_type IS 'Primary monetization strategy for this article.';
COMMENT ON COLUMN articles.cta_type IS 'Primary call-to-action type for this article.';
COMMENT ON COLUMN articles.article_template IS 'Editorial template/format used for this article.';
COMMENT ON COLUMN articles.is_pillar_content IS 'True if this is a main pillar/hub article.';
COMMENT ON COLUMN articles.is_cornerstone IS 'True if this is an evergreen cornerstone piece.';
