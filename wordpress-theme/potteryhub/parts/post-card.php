<?php
/**
 * Journal card.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
$ph_i = isset( $args['i'] ) ? (int) $args['i'] : 0;
?>
<article <?php post_class( 'pcard' ); ?> data-rv style="--d:<?php echo (int) ( $ph_i % 3 ) * 100; ?>ms">
	<a class="pc-img" href="<?php the_permalink(); ?>" data-cur="<?php esc_attr_e( 'Read', 'potteryhub' ); ?>">
		<?php if ( has_post_thumbnail() ) : ?>
			<?php the_post_thumbnail( 'medium_large', array( 'loading' => 'lazy' ) ); ?>
		<?php else : ?>
			<span class="pc-ph"><img src="<?php echo esc_url( ph_img( 'emblem-light.png' ) ); ?>" alt=""></span>
		<?php endif; ?>
	</a>
	<div class="pc-meta"><?php echo esc_html( get_the_date() ); ?><?php $ph_c = get_the_category(); ?><?php if ( $ph_c ) : ?> · <?php echo esc_html( $ph_c[0]->name ); ?><?php endif; ?></div>
	<h2 class="serif"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
	<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 24 ) ); ?></p>
	<a class="pc-more" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read more', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
</article>
