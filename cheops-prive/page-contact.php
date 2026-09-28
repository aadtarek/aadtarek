<?php
if (!defined('ABSPATH')) exit;
?>
<?php
/* This template's footer uses SVG social icons; other pages retain their current footer. */
if (function_exists('cheops_site_footer')) {
    remove_action('wp_footer', 'cheops_site_footer', 5);
    add_action('wp_footer', static function () {
        ob_start();
        cheops_site_footer();
        $cheops_home_footer = ob_get_clean();
        echo strtr($cheops_home_footer, [
        'Facebook ↗' => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M13.3 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.1v3.2h2.8V21z"/></svg><span class="cheops-home-sr-only">Facebook</span>',
        'Instagram ↗' => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r="1.1"/></svg><span class="cheops-home-sr-only">Instagram</span>',
        'LinkedIn ↗' => '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5.4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.7 8.5H7V21H3.7Zm5.5 0h3.2v1.7h.1c.5-1 1.6-2 3.6-2 3.8 0 4.5 2.4 4.5 5.5V21h-3.4v-6.5c0-1.6 0-3.5-2.1-3.5s-2.5 1.7-2.5 3.4V21H9.2Z"/></svg><span class="cheops-home-sr-only">LinkedIn</span>',
        ]);
    }, 5);
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php cheops_page_css('contact'); ?>
<?php wp_head(); ?>
</head>
<body <?php body_class('cheops-contact-page cheops-contact-edited'); ?>>
<?php wp_body_open(); cheops_site_header(); ?>
<main>
<section class="contact-hero">
  <div class="contact-hero-media" aria-hidden="true"></div>
  <div class="contact-wrap contact-hero-inner">
    <div>
      <div class="contact-eyebrow">Private property advisory</div>
      <h1 class="contact-title d">Let’s define your next address.</h1>
      <p class="contact-lead">Whether you are buying, renting, investing or positioning an asset for the market, start with a private conversation with Cheops Privé.</p>
      <div class="contact-hero-actions">
        <a class="contact-call" href="<?php echo esc_url(cheops_phone_url()); ?>"><span>Call us</span><b><?php echo cheops_arrow_icon(); ?></b></a>
        <a class="contact-whatsapp" href="<?php echo esc_url(cheops_whatsapp_url()); ?>" target="_blank" rel="noopener"><span>WhatsApp</span><b><?php echo cheops_arrow_icon(); ?></b></a>
      </div>
    </div>
    <aside class="contact-info-panel">
      <div class="contact-info-row"><small>Head office</small><p><?php echo esc_html(cheops_address()); ?></p></div>
      <div class="contact-info-row"><small>Phone</small><a href="<?php echo esc_url(cheops_phone_url()); ?>"><?php echo esc_html(cheops_phone_display()); ?></a></div>
      <div class="contact-info-row"><small>Email</small><a href="mailto:<?php echo esc_attr(cheops_email()); ?>"><?php echo esc_html(cheops_email()); ?></a></div>
    </aside>
  </div>
</section>
<section class="contact-main">
  <div class="contact-wrap contact-main-grid">
    <div class="contact-copy">
      <div class="contact-eyebrow">Start a conversation</div>
      <h2 class="d">Tell us what you’re looking for.</h2>
      <p>Share the essentials and our team can continue the conversation with the context that matters: the purpose, preferred location, property type and whether you are looking to buy or rent.</p>
    </div>
    <div class="contact-form-card">
      <h3 class="d">Private enquiry</h3>
      <p>Leave your details and tell us how we can help.</p>
      <?php if (isset($_GET['contact']) && $_GET['contact']==='sent'): ?><div class="contact-alert success">Thank you. Your enquiry has been sent.</div><?php elseif(isset($_GET['contact']) && $_GET['contact']==='missing'): ?><div class="contact-alert error">Please add your name and phone number.</div><?php endif; ?>
      <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
        <input type="hidden" name="action" value="cheops_contact">
        <?php wp_nonce_field('cheops_contact_form','cheops_contact_nonce'); ?>
        <div class="contact-fields">
          <div class="contact-field"><label for="cheops-name">Name *</label><input id="cheops-name" name="name" required></div>
          <div class="contact-field"><label for="cheops-phone">Phone *</label><input id="cheops-phone" name="phone" inputmode="tel" required></div>
          <div class="contact-field"><label for="cheops-email">Email</label><input id="cheops-email" type="email" name="email"></div>
          <div class="contact-field"><label for="cheops-interest">I’m interested in</label><select id="cheops-interest" name="interest"><option>Buying a property</option><option>Renting a property</option><option>Buying an office</option><option>Renting an office</option><option>business consultation</option></select></div>
          <div class="contact-field full"><label for="cheops-message">Message</label><textarea id="cheops-message" name="message" placeholder="Location, budget, property type, timeline…"></textarea></div>
        </div>
        <button class="contact-submit" type="submit"><span>Send enquiry</span><b><?php echo cheops_arrow_icon_right(); ?></b></button>
      </form>
    </div>
  </div>
</section>
</main>
<?php wp_footer(); ?>
</body></html>
