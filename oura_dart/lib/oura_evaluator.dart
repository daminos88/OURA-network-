import 'oura_errors.dart';
import 'oura_types.dart';

class OuraEvaluator {
  static const supportedVersion = '1.0.0';

  final Map<String, dynamic> policy;

  OuraEvaluator(this.policy) {
    _validatePolicy();
  }

  OuraEvaluationResult evaluate(Map<String, dynamic> context) {
    final rules = (policy['rules'] as List<dynamic>).cast<Map<String, dynamic>>();

    final indexed = rules.asMap().entries.toList()
      ..sort((a, b) {
        final pA = a.value['priority'] as int? ?? 0;
        final pB = b.value['priority'] as int? ?? 0;
        if (pA != pB) return pB.compareTo(pA);
        return a.key.compareTo(b.key);
      });

    final matches = <Map<String, dynamic>>[];

    for (final item in indexed) {
      if (_evalExpr(item.value['when'], context)) {
        matches.add(item.value);
      }
    }

    if (matches.isEmpty) {
      return const OuraEvaluationResult(
        matched: false,
        matchedRules: [],
        scores: null,
        meta: OuraMeta(
          ouraVersion: supportedVersion,
          selectedPriority: null,
        ),
      );
    }

    final highest = matches.first['priority'] as int;
    final selected = matches.where((r) => r['priority'] == highest).toList();

    final ids = selected.map((r) => r['rule_id'] as String).toList();
    final rScore = selected
        .map((r) => ((r['set'] as Map<String, dynamic>)['R'] as num).toDouble())
        .reduce((a, b) => a > b ? a : b);
    final bScore = selected
        .map((r) => ((r['set'] as Map<String, dynamic>)['B'] as num).toDouble())
        .reduce((a, b) => a > b ? a : b);

    return OuraEvaluationResult(
      matched: true,
      matchedRules: ids,
      scores: OuraScores(R: rScore, B: bScore),
      meta: OuraMeta(
        ouraVersion: supportedVersion,
        selectedPriority: highest,
      ),
    );
  }

  void _validatePolicy() {
    final version = policy['oura_version'];
    if (version is! String) {
      throw const InvalidPolicyError('Missing oura_version');
    }
    if (version != supportedVersion) {
      throw UnsupportedVersionError('Unsupported OURA version: $version');
    }

    final rules = policy['rules'];
    if (rules is! List || rules.isEmpty) {
      throw const InvalidPolicyError('Policy must contain a non-empty rules array');
    }

    for (final rawRule in rules) {
      final rule = rawRule as Map<String, dynamic>;
      _validateRule(rule);
    }
  }

  void _validateRule(Map<String, dynamic> rule) {
    for (final key in ['rule_id', 'name', 'priority', 'when', 'set']) {
      if (!rule.containsKey(key)) {
        throw InvalidPolicyError('Rule missing $key');
      }
    }

    final priority = rule['priority'];
    if (priority is! int || priority < 0) {
      throw const InvalidPolicyError('Invalid priority');
    }

    final set = rule['set'];
    if (set is! Map<String, dynamic>) {
      throw const InvalidPolicyError('Invalid set block');
    }

    final r = set['R'];
    final b = set['B'];

    if (r is! num || b is! num) {
      throw const InvalidPolicyError('Missing R/B');
    }

    if (r < 0 || r > 1 || b < 0 || b > 1) {
      throw const InvalidPolicyError('R/B out of range');
    }

    _validateExpr(rule['when']);
  }

  void _validateExpr(dynamic expr) {
    if (expr is! Map<String, dynamic>) {
      throw const InvalidPolicyError('Invalid expression');
    }

    final type = expr['type'];
    if (type == 'comparison') {
      if (!expr.containsKey('field') ||
          !expr.containsKey('op') ||
          !expr.containsKey('value')) {
        throw const InvalidPolicyError('Invalid comparison expression');
      }
      return;
    }

    if (type == 'logical') {
      final op = expr['op'];
      final children = expr['children'];
      if (op is! String || (op != 'AND' && op != 'OR')) {
        throw const InvalidPolicyError('Invalid logical op');
      }
      if (children is! List || children.length < 2) {
        throw const InvalidPolicyError('Logical expression must have at least 2 children');
      }
      for (final child in children) {
        _validateExpr(child);
      }
      return;
    }

    throw const InvalidPolicyError('Unknown expression type');
  }

  bool _evalExpr(dynamic expr, Map<String, dynamic> context) {
    if (expr is! Map<String, dynamic>) {
      throw const EvaluationFailureError('Invalid expression');
    }

    final type = expr['type'];
    if (type == 'comparison') {
      final field = expr['field'] as String? ?? '';
      final op = expr['op'] as String? ?? '';
      final expected = expr['value'];
      final actual = context.containsKey(field) ? context[field] : null;
      return _compare(actual, op, expected);
    }

    if (type == 'logical') {
      final op = expr['op'] as String? ?? '';
      final children = (expr['children'] as List<dynamic>? ?? const []);
      if (op == 'AND') {
        return children.every((child) => _evalExpr(child, context));
      }
      if (op == 'OR') {
        return children.any((child) => _evalExpr(child, context));
      }
      throw const EvaluationFailureError('Unknown logical op');
    }

    throw const EvaluationFailureError('Unknown expression type');
  }

  bool _compare(dynamic actual, String op, dynamic expected) {
    if (op == '==') {
      return _isEqual(actual, expected);
    }
    if (op == '!=') {
      return !_isEqual(actual, expected);
    }
    if (actual == null) {
      return false;
    }
    if (op == 'IN') {
      if (expected is! List) return false;
      return expected.any((e) => _isEqual(actual, e));
    }

    if (actual is! num || expected is! num) {
      return false;
    }

    switch (op) {
      case '>':
        return actual > expected;
      case '<':
        return actual < expected;
      case '>=':
        return actual >= expected;
      case '<=':
        return actual <= expected;
      default:
        return false;
    }
  }

  bool _isEqual(dynamic a, dynamic b) {
    if (a == null && b == null) return true;
    if (a is String && b is String) return a == b;
    if (a is num && b is num) return a.toDouble() == b.toDouble();
    if (a is bool && b is bool) return a == b;
    return false;
  }
}
