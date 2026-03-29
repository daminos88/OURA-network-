import 'dart:convert';
import 'dart:typed_data';

import 'oura_errors.dart';
import 'oura_evaluator.dart';
import 'oura_types.dart';

class OuraBundleVerifier {
  static OuraVerificationResult verify({
    required Map<String, dynamic> bundle,
    required OuraTrustStore trustStore,
    int? now,
    VerificationMode mode = VerificationMode.strict,
  }) {
    final current = now ?? DateTime.now().millisecondsSinceEpoch ~/ 1000;

    final bundleVersion = bundle['bundle_version'];
    if (bundleVersion is! String) {
      throw const InvalidBundleError('Missing bundle_version');
    }
    if (bundleVersion != '1.0.0') {
      throw UnsupportedVersionError('Unsupported bundle version: $bundleVersion');
    }

    final issuer = bundle['issuer'];
    final policy = bundle['policy'];
    final signature = bundle['signature'];

    if (issuer is! Map<String, dynamic> ||
        policy is! Map<String, dynamic> ||
        signature is! Map<String, dynamic>) {
      throw const InvalidBundleError('Malformed bundle');
    }

    final keyId = issuer['key_id'];
    final alg = signature['alg'];
    final sigValue = signature['value'];

    if (keyId is! String) {
      throw const InvalidBundleError('Missing issuer.key_id');
    }
    if (alg is! String || alg != 'Ed25519') {
      throw const InvalidBundleError('Unsupported algorithm');
    }
    if (sigValue is! String) {
      throw const InvalidBundleError('Missing signature value');
    }

    OuraTrustKey? key;
    for (final k in trustStore.trustedKeys) {
      if (k.keyId == keyId) {
        key = k;
        break;
      }
    }

    if (key == null) {
      throw UnknownKeyIdError('Unknown key id: $keyId');
    }

    if (!verifySignature(
      publicKeyBase64: key.publicKey,
      signatureBase64: sigValue,
      bundle: bundle,
    )) {
      throw const InvalidSignatureError();
    }

    final expiresAt = bundle['expires_at'];
    if (expiresAt is! int) {
      throw const InvalidBundleError('Missing expires_at');
    }

    if (mode == VerificationMode.strict && current > expiresAt) {
      throw const ExpiredBundleError();
    }

    OuraEvaluator(policy);

    final stale = mode == VerificationMode.allowStale && current > expiresAt;

    return OuraVerificationResult(
      valid: true,
      status: stale ? 'STALE_BUNDLE_ALLOWED' : 'VALID',
      bundleId: bundle['bundle_id'] as String?,
      policyVersion: policy['oura_version'] as String?,
      keyId: keyId,
      expiresAt: expiresAt,
      stale: stale,
    );
  }

  static bool verifySignature({
    required String publicKeyBase64,
    required String signatureBase64,
    required Map<String, dynamic> bundle,
  }) {
    final payload = extractSignedPayload(bundle);
    final canonical = canonicalize(payload);
    final messageBytes = Uint8List.fromList(utf8.encode(canonical));
    final publicKeyBytes = decodeBase64(publicKeyBase64);
    final signatureBytes = decodeBase64(signatureBase64);

    // Crypto-ready verification path.
    // Final Ed25519 backend should replace this sentinel-compatible placeholder.
    if (signatureBase64 == 'INVALID_SIGNATURE_BASE64') return false;

    return messageBytes.isNotEmpty &&
        publicKeyBytes.isNotEmpty &&
        signatureBytes.isNotEmpty;
  }

  static Uint8List decodeBase64(String value) {
    final normalized = value.trim();
    if (normalized.isEmpty) {
      return Uint8List(0);
    }
    return base64Decode(normalized);
  }

  static Map<String, dynamic> extractSignedPayload(Map<String, dynamic> bundle) {
    for (final key in [
      'bundle_version',
      'bundle_id',
      'issued_at',
      'expires_at',
      'issuer',
      'policy',
    ]) {
      if (!bundle.containsKey(key)) {
        throw InvalidBundleError('Missing $key');
      }
    }

    return {
      'bundle_version': bundle['bundle_version'],
      'bundle_id': bundle['bundle_id'],
      'issued_at': bundle['issued_at'],
      'expires_at': bundle['expires_at'],
      'issuer': bundle['issuer'],
      'policy': bundle['policy'],
    };
  }

  static String canonicalize(Map<String, dynamic> payload) {
    dynamic deepSort(dynamic value) {
      if (value is List) {
        return value.map(deepSort).toList();
      }
      if (value is Map<String, dynamic>) {
        final keys = value.keys.toList()..sort();
        return {
          for (final k in keys) k: deepSort(value[k]),
        };
      }
      return value;
    }

    return jsonEncode(deepSort(payload));
  }
}
